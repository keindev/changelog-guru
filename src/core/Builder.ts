import { promises as fs } from 'fs';
import Package from 'package-json-helper';
import { PackageDependency, PackageRestriction } from 'package-json-helper/lib/types';
import path from 'path';
import TaskTree from 'tasktree-cli';

import md from '../utils/markdown.js';
import { findSame } from '../utils/text.js';
import { Config, GitServiceProvider } from './Config.js';
import Commit, { ICommit } from './entities/Commit.js';
import Message from './entities/Message.js';
import Section, { ISection } from './entities/Section.js';
import GitHubProvider from './providers/GitHubProvider.js';
import GitLabProvider from './providers/GitLabProvider.js';
import { IGitProvider } from './providers/GitProvider.js';
import State from './State.js';

export default class Builder {
  #config: Config;
  #package: Package;
  #state?: State;

  constructor(config: Config) {
    this.#config = config;
    this.#package = new Package();
  }

  async build(): Promise<void> {
    await this.#config.init();
    await this.#package.read();

    if (this.#package.repository?.url) {
      const provider = new {
        [GitServiceProvider.GitHub]: GitHubProvider,
        [GitServiceProvider.GitLab]: GitLabProvider,
      }[this.#config.provider](this.#package.repository.url, this.#config.branch);

      await this.read(provider);
      await this.write(provider);
    } else {
      TaskTree.fail('Package repository url is not defined!');
    }
  }

  private async bumpPackage(provider: IGitProvider): Promise<void> {
    if (this.#config.bump && this.#package.version && this.#state) {
      const task = TaskTree.add('Updating package version');
      const date = await provider.getLastChangeDate(true);
      const { version: prevVersion } = await provider.getCurrentPackage(date);
      const { version } = this.#package;

      if (prevVersion && prevVersion !== version) {
        task.skip(
          `Package version is already changed from {bold ${prevVersion}(${provider.branch.dev})} to {bold ${version}}`
        );
      } else {
        const [major, minor, patch] = this.#state.changesLevels;

        if (major || minor || patch) {
          this.#package.bump({ major, minor, patch });
          await this.#package.save();
          task.complete(`Package version updated to {bold ${this.#package.version}}`);
        } else {
          task.skip('Package version does not change');
        }
      }

      task.clear();
    }
  }

  private async read(provider: IGitProvider): Promise<void> {
    const stage = TaskTree.add('Loading repository changes...');

    try {
      const date = await provider.getLastChangeDate();
      const commits = await provider.getCommits(date);
      const previousPackage = await provider.getPreviousPackage(date);

      if (this.#package.license) {
        const state = new State(this.#package.license, previousPackage.license);

        [...Object.values(PackageDependency), ...Object.values(PackageRestriction)].forEach(name => {
          state.addChanges(name, this.#package.getChanges(name, previousPackage));
        });

        commits.forEach(commit => state.addCommit(commit));
        this.#state = state;

        stage.clear();
        stage.log(`Branch {bold ${this.#config.branch}} last changes at: {bold ${date.toLocaleString()}}`);
        stage.log(`{bold ${commits.length}} commits loaded`);
        stage.complete('Release information:');
      } else {
        stage.fail('Package license is not defined');
      }
    } catch (error) {
      stage.error(error, true);
    }
  }

  private renderCommits(commits: ICommit[]): string[] {
    const groups = new Map<string, { accents: Set<string>; links: string[]; subject: string }>();

    commits.forEach(commit => {
      const subject = findSame(commit.subject, [...groups.keys()]) ?? commit.subject;
      const { accents, links } = groups.get(subject) ?? { subject, accents: new Set(), links: [] };

      commit.accents.forEach(accent => accents.add(accent));
      links.push(md.commit(commit.shortName, commit.url));
      groups.set(commit.subject, { subject, accents, links });
    });

    return [
      ...[...groups.values()].map(({ subject, accents, links }) =>
        md.list(
          [
            accents.size ? md.strong(`[${[...accents.values()].map(md.capitalize).join(', ')}]`) : '',
            md.capitalize(subject),
            ...links,
          ]
            .filter(Boolean)
            .join(' ')
        )
      ),
      '',
    ];
  }

  private renderSection(section: ISection, level = 1): string {
    const sections = section.sections.filter(Section.filter);
    const commits = section.commits.filter(Commit.filter);
    const messages = section.messages.filter(Message.filter);
    const output = section.isDetails ? [md.summary(section.title)] : [md.title(section.title, level)];

    if (messages.length) output.push(...messages.map(message => message.text), '');
    if (sections.length) output.push(...sections.map(subsection => this.renderSection(subsection, level + 1)));
    if (sections.length && commits.length) output.push(md.title('Others', level + 1));
    if (commits.length) output.push(...this.renderCommits(commits));

    return section.isDetails ? md.details(output.join('\n')) : output.join('\n');
  }

  private async write(provider: IGitProvider): Promise<void> {
    if (this.#state) {
      const task = TaskTree.add('Generate changelog...');

      this.#state.updateCommitsChangeLevel(this.#config.types);
      this.#state.ignore(this.#config.exclusions);
      await this.#state.modify(this.#config.rules);

      const data = this.#state.sections.map(subsection => this.renderSection(subsection));
      const filePath = path.resolve(process.cwd(), this.#config.filePath);

      if (this.#state.authors) {
        data.push(md.contributors(this.#state.authors.map(({ name, avatar, url }) => md.image(name, avatar, url))), '');
      }

      await fs.writeFile(filePath, data.join('\n'));
      await this.bumpPackage(provider);

      task.complete('Changelog generated!');
    }
  }
}
