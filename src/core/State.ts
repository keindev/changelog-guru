import { IPackageChange, PackageDependency, PackageRestriction } from 'package-json-helper/lib/types';
import TaskTree from 'tasktree-cli';

import { findSame, isSame, unify } from '../utils/text';
import { Exclusion } from './Config';
import Author, { IAuthor } from './entities/Author';
import Commit, { ICommit } from './entities/Commit';
import { ChangeLevel } from './entities/Entity';
import Section, { ISection, ISectionOptions, SectionOrder, SectionPosition } from './entities/Section';
import { IRule, IRuleContext } from './rules/BaseRule';

export default class State implements IRuleContext {
  #authors = new Map<string, IAuthor>();
  #changes = new Map<PackageDependency | PackageRestriction, IPackageChange[]>();
  #commits = new Map<string, ICommit>();
  readonly currentLicense: string;
  readonly hasChangedLicense: boolean;
  readonly previousLicense?: string;
  #sections: ISection[] = [];

  constructor(currentLicense: string, previousLicense?: string) {
    this.currentLicense = currentLicense;
    this.previousLicense = previousLicense;
    this.hasChangedLicense = !previousLicense || !!currentLicense.localeCompare(previousLicense);
  }

  get sections(): ISection[] {
    return this.#sections;
  }

  get authors(): IAuthor[] {
    return [...this.#authors.values()].filter(Author.filter).sort(Author.compare);
  }

  get commits(): ICommit[] {
    return [...this.#commits.values()].filter(Commit.filter).sort(Commit.compare);
  }

  get changesLevels(): [number, number, number] {
    let major = 0;
    let minor = 0;
    let patch = 0;

    if (
      this.#changes.has(PackageDependency.Engines) ||
      this.#changes.has(PackageRestriction.OS) ||
      this.#changes.has(PackageRestriction.CPU)
    ) {
      major++;
    } else {
      this.#commits.forEach(commit => {
        switch (commit.level) {
          case ChangeLevel.Major:
            major++;
            break;
          case ChangeLevel.Minor:
            minor++;
            break;
          case ChangeLevel.Patch:
            patch++;
            break;
          default:
            TaskTree.fail(`Incompatible ChangeLevel - {bold ${commit.level}}`);
        }
      });
    }

    return [major, minor, patch];
  }

  addChanges(type: PackageDependency | PackageRestriction, changes: IPackageChange[]): void {
    this.#changes.set(type, changes);
  }

  addCommit(commit: ICommit): void {
    if (!this.#commits.has(commit.name)) {
      const { author } = commit;

      this.#commits.set(commit.name, commit);

      if (this.#authors.has(author.name)) {
        author.contribute();
      } else {
        this.#authors.set(author.name, author);
      }
    }
  }

  addSection(options: ISectionOptions): ISection | undefined {
    const { name, position = SectionPosition.Group, order = SectionOrder.Default, emoji } = options;
    let section = this.findSection(name);

    if (!section && unify(name)) {
      this.#sections.push((section = new Section({ name, position, order, emoji })));
    }

    return section;
  }

  findSection(name: string): ISection | undefined {
    return this.#sections.find((section): boolean => isSame(section.name, name));
  }

  getChanges(type: PackageDependency | PackageRestriction): IPackageChange[] {
    return [...(this.#changes.get(type) ?? [])];
  }

  ignore(exclusions: [Exclusion, string[]][]): void {
    const callbacks = {
      [Exclusion.AuthorLogin]: (rules: string[]) =>
        this.#authors.forEach(author => (author.isIgnored = rules.includes(author.login))),
      [Exclusion.CommitType]: (rules: string[]) =>
        this.#commits.forEach(commit => (commit.isIgnored = !!findSame(commit.type, rules))),
      [Exclusion.CommitScope]: (rules: string[]) =>
        this.#commits.forEach(commit => (commit.isIgnored = !!(commit.scope && findSame(commit.scope, rules)))),
      [Exclusion.CommitSubject]: (rules: string[]) =>
        this.#commits.forEach(commit => (commit.isIgnored = rules.some(item => commit.subject.includes(item)))),
    };

    exclusions.forEach(([type, rules]) => {
      if (callbacks[type]) {
        callbacks[type](rules);
      } else {
        TaskTree.fail(`Unacceptable entity exclusion type - {bold ${type}}`);
      }
    });
  }

  modify(rules: IRule[]): void {
    const task = TaskTree.add('Formate changelog structure...');

    rules.forEach(rule => rule.prepare && rule.prepare({ context: this }));
    rules.forEach(rule => {
      if (rule.parse) this.commits.forEach(commit => rule.parse && rule.parse({ commit, context: this }));
      if (rule.modify) rule.modify({ task, context: this });
    });

    const subtask = task.add('Bringing the section tree to a consistent state...');
    const sections = this.sections.sort(Section.compare);
    const relations: Map<string, Section> = new Map();

    sections.forEach(section => {
      section.assign(relations, section.isGroup ? SectionPosition.Subsection : undefined);
    });

    this.#sections = sections.filter(section => Section.filter(section) && !section.isSubsection).sort(Section.compare);

    subtask.complete();
    task.complete('Changelog structure is formate!', true);
  }

  updateCommitsChangeLevel(types: [string, ChangeLevel][]): void {
    this.#commits.forEach(commit => {
      const [, level] = types.find(([name]) => isSame(commit.type, name)) ?? [];

      if (level) commit.level = level;
    });
  }
}
