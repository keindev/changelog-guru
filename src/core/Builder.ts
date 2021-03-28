import fs from 'fs';
import path from 'path';
import { coerce } from 'semver';
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
  #provider: IGitProvider;

  constructor(config: Config) {
    this.#config = config;
    this.#package = new Package();
    this.#provider = new PROVIDERS_MAP[this.#config.provider](this.#package.repository, this.#config.branch);
  }

  async build(): Promise<void> {
    await this.read();

    if (this.#state) {
      this.#state.updateCommitsChangeLevel(this.#config.types);
      this.#state.ignore(this.#config.exclusions);
      await this.#state.modify(this.#config.rules);
      await this.write();

      if (this.#config.bump) await this.#package.bump(...this.#state.changesLevels);
    }
  }

  private async read(): Promise<void> {
    const stage = TaskTree.add('Loading a release state...');
    const task = stage.add('Loading repository changes...');
    const date = await this.#provider.getLastChangeDate();
    const commits = await this.#provider.getCommits(date);
    const previousPackage = await this.#provider.getPreviousPackage(date);
    const state = new State(this.#package.license, previousPackage.license);

    stage.log(`Main branch last changes date: {bold ${date}}`);

    [...Object.values(Dependency), ...Object.values(Restriction)].forEach(name => {
      const previousValues = previousPackage[name];

      if (previousValues) state.addChanges(name, this.#package.getChanges(name, previousValues));
    });

    commits.forEach(commit => state.addCommit(commit));
    task.complete(`{bold ${commits.length}} commits loaded`, true);
    this.#state = state;

    stage.complete('Release information:');
  }

  private async write(bump = false): Promise<void> {
    if (this.#state) {
      const { sections, authors, changesLevels } = this.#state;
      const task = TaskTree.add('Writing new changelog...');
      const data = sections.map(subsection => this.renderSection(subsection));
      const filePath = path.resolve(process.cwd(), this.#config.filePath);

      data.push(md.contributors(authors.map(({ name, avatar, url }) => md.image(name, avatar, url))), '');
      await fs.promises.writeFile(filePath, data.join('\n'));
      task.complete('Changelog generated!');

      if (bump) {
        const date = await this.#provider.getLastChangeDate(true);
        const { version } = await this.#provider.getCurrentPackage(date);

        await this.#package.bump(...changesLevels, coerce(version) ?? undefined);
      }
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
