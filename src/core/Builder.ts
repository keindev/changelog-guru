import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import * as md from '../utils/markdown';

import { findSame } from '../utils/text';
import { Config, GitServiceProvider } from './Config';
import Commit, { ICommit } from './entities/Commit';
import Message from './entities/Message';
import Section, { ISection } from './entities/Section';
import Package, { Dependency, Restriction } from './Package';
import GitHubProvider from './providers/GitHubProvider';
import GitLabProvider from './providers/GitLabProvider';
import { IGitProvider } from './providers/GitProvider';
import State from './State';

const PROVIDERS_MAP = {
  [GitServiceProvider.GitHub]: GitHubProvider,
  [GitServiceProvider.GitLab]: GitLabProvider,
};

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

    const provider = new PROVIDERS_MAP[this.#config.provider](this.#package.repository, this.#config.branch);

    await this.read(provider);
    await this.write(provider);
  }

  private async read(provider: IGitProvider): Promise<void> {
    const stage = TaskTree.add('Loading repository changes...');
    const date = await provider.getLastChangeDate();
    const commits = await provider.getCommits(date);
    const previousPackage = await provider.getPreviousPackage(date);
    const state = new State(this.#package.license, previousPackage.license);

    [...Object.values(Dependency), ...Object.values(Restriction)].forEach(name => {
      const previousValues = previousPackage[name];

      if (previousValues) state.addChanges(name, this.#package.getChanges(name, previousValues));
    });

    commits.forEach(commit => state.addCommit(commit));
    this.#state = state;

    stage.clear();
    stage.log(`Branch {bold ${this.#config.branch}} last changes at: {bold ${date.toLocaleString()}}`);
    stage.log(`{bold ${commits.length}} commits loaded`);
    stage.complete('Release information:');
  }

  private async write(provider: IGitProvider): Promise<void> {
    if (this.#state) {
      const task = TaskTree.add('Generate changelog...');

      this.#state.updateCommitsChangeLevel(this.#config.types);
      this.#state.ignore(this.#config.exclusions);
      await this.#state.modify(this.#config.rules);

      const data = this.#state.sections.map(subsection => this.renderSection(subsection));
      const filePath = path.resolve(process.cwd(), this.#config.filePath);

      data.push(md.contributors(this.#state.authors.map(({ name, avatar, url }) => md.image(name, avatar, url))), '');
      await fs.promises.writeFile(filePath, data.join('\n'));

      if (this.#config.bump) {
        const date = await provider.getLastChangeDate(true);
        const { version } = await provider.getCurrentPackage(date);
        const [major, minor, patch] = this.#state.changesLevels;

        task.clear();
        await this.#package.bump({ major, minor, patch, branch: provider.branch.dev, version });
      }

      task.complete('Changelog generated!');
    }
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

  private renderCommits(commits: ICommit[]): string[] {
    const groups = new Map<string, { subject: string; accents: Set<string>; links: string[] }>();

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
}
