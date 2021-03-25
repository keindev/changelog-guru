import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import * as md from '../utils/markdown';

import { findSame } from '../utils/text';
import { Config, GitServiceProvider } from './Config';
import Commit from './entities/Commit';
import Message from './entities/Message';
import Section, { ISection } from './entities/Section';
import Package, { Dependency, Restriction } from './Package';
import GitHubProvider from './providers/GitHubProvider';
import GitLabProvider from './providers/GitLabProvider';
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
    const provider = new PROVIDERS_MAP[this.#config.provider](this.#package.repository, this.#config.branch);
    const date = await provider.getLastChangeDate();

    stage.log(`Main branch last changes date: {bold ${date}}`);

    if (date) {
      const task = stage.add('Loading repository changes...');
      const commits = await provider.getCommits(date);
      const previousPackage = await provider.getPrevPackage(date);
      const state = new State(this.#package.license, previousPackage.license);

      [...Object.values(Dependency), ...Object.values(Restriction)].forEach(name => {
        const previousValues = previousPackage[name];

        if (previousValues) state.addChanges(name, this.#package.getChanges(name, previousValues));
      });

      commits.forEach(commit => state.addCommit(commit));
      task.complete(`{bold ${commits.length}} commits loaded`, true);
      this.#state = state;
    } else {
      stage.warn(`Branch don't have commits since ${date}`);
    }

    stage.complete('Release information:');
  }

  private async write(bump = false): Promise<void> {
    if (this.#state) {
      const { sections, authors, changesLevels } = this.#state;
      const task = TaskTree.add('Writing new changelog...');
      const data = sections.map(subsection => this.render(subsection));
      const filePath = path.resolve(process.cwd(), this.#config.filePath);

      data.push(md.contributors(authors.map(({ name, avatar, url }) => md.image(name, avatar, url))), '');
      await fs.promises.writeFile(filePath, data.join('\n'));
      task.complete('Changelog generated!');

      if (bump) await this.#package.bump(...changesLevels);
    }
  }

  private render(section: ISection, level = 1): string {
    const sections = section.sections.filter(Section.filter);
    const commits = section.commits.filter(Commit.filter);
    const messages = section.messages.filter(Message.filter);
    const output = [md.title(section.name, level)];
    const groups = new Map<string, { subject: string; accents: Set<string>; links: string[] }>();

    if (messages.length) output.push(...messages.map(message => message.text), '');
    if (sections.length) output.push(...sections.map(subsection => this.render(subsection, level + 1)));
    if (sections.length && commits.length) output.push(md.title('Others', level + 1));
    if (commits.length) {
      commits.forEach(commit => {
        const subject = findSame(commit.subject, [...groups.keys()]) ?? commit.subject;
        const { accents, links } = groups.get(subject) ?? { subject, accents: new Set<string>(), links: [] };

        commit.accents.forEach(accents.add);
        links.push(md.commit(commit.shortName, commit.url));
        groups.set(commit.subject, { subject, accents, links });
      });

      output.push(
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
        ''
      );
    }

    return output.join('\n');
  }
}
