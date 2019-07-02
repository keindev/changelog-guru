import path from 'path';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Key from '../utils/key';
import { Config, ConfigOptions } from './config';
import Section, { Position } from './section';
import { Constructable, Importable } from '../utils/types';
import Version from '../utils/version';
import { FilterType } from '../utils/enums';

const $tasks = TaskTree.tree();

export interface Context {
    findSection(title: string): Section | undefined;
    addSection(title: string, position: Position): Section;
}

export default class State implements Context {
    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private version: string;

    public constructor(version: string = Version.DEFAULT) {
        this.version = version;
    }

    private static matchSubsectionWith(section: Section, relations: Map<string, Section>): void {
        const commits = section.getCommits();
        let parent: Section | undefined;

        if (commits.length) {
            parent = relations.get(commits[0].hash);

            if (parent) parent.assign(section);

            commits.forEach((commit): void => {
                parent = relations.get(commit.hash);

                if (parent) parent.remove(commit);

                relations.set(commit.hash, section);
            });
        }
    }

    private static matchSectionWith(section: Section, relations: Map<string, Section>): void {
        const commits = section.getCommits();

        commits.forEach((commit): void => {
            if (relations.has(commit.hash)) {
                section.remove(commit);
            } else {
                relations.set(commit.hash, section);
            }
        });
    }

    public setVersion(version: string): void {
        const newVersion = Version.clear(version);

        if (!!newVersion && Version.greaterThan(newVersion, this.version)) this.version = newVersion;
    }

    public getVersion(): string {
        return this.version;
    }

    public getSections(): Section[] {
        return this.sections;
    }

    public getAuthors(): Author[] {
        return [...this.authors.values()].sort((a, b): number => b.getContribution() - a.getContribution());
    }

    public addCommit(commit: Commit, author: Author): void {
        const { commits, authors } = this;

        if (!commits.has(commit.hash)) {
            commits.set(commit.hash, commit);

            const actualAuthor = authors.get(author.id);

            if (actualAuthor) {
                actualAuthor.increaseContribution();
            } else {
                authors.set(author.id, author);
            }
        }
    }

    public addSection(title: string, position: Position = Position.Group): Section {
        let section = this.findSection(title);

        if (typeof section === 'undefined') {
            this.sections.push((section = new Section(title, position)));
        }

        return section;
    }

    public findSection(title: string): Section | undefined {
        return this.sections.find((s): boolean => Key.isEqual(s.title, title));
    }

    public async modify(config: Config): Promise<void> {
        const task = $tasks.add('Modify release state');
        const plugins = config.getPlugins();
        const options = config.getOptions();

        this.ignoreAuthors(config);
        this.ignoreCommits(config);
        this.updateCommitsTypes(config);

        await Promise.all(plugins.map((p): Promise<void> => this.importPlugin(p, options, task)));

        this.updateSections();
        this.updateVersion();
        task.complete();
    }

    private ignoreAuthors(config: Config): void {
        const list = config.getFilters(FilterType.AuthorLogin);

        this.authors.forEach((author): void => {
            if (list.indexOf(author.login) >= 0) {
                author.ignore();
            }
        });
    }

    private ignoreCommits(config: Config): void {
        const types = config.getFilters(FilterType.CommitType);
        const scopes = config.getFilters(FilterType.CommitScope);
        const subjects = config.getFilters(FilterType.CommitSubject);

        this.commits.forEach((commit): void => {
            if (
                subjects.some((item): boolean => commit.subject.includes(item)) ||
                Key.inArray(commit.getType(), types) ||
                Key.inArray(commit.getScope(), scopes)
            ) {
                commit.ignore();
            }
        });
    }

    private updateSections(): void {
        const task = $tasks.add('Build sections tree');
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach((s): void => {
                if (s.getPosition() === Position.Group) {
                    State.matchSubsectionWith(s, relations);
                } else {
                    State.matchSectionWith(s, relations);
                }
            });
        }

        this.sections = sections
            .filter((s): boolean => s.getPosition() !== Position.Subsection && !!s.getPriority() && !s.isEmpty())
            .sort(Section.compare)
            .reverse();
        task.complete();
    }

    private updateCommitsTypes(config: Config): void {
        let type: string | undefined;

        this.commits.forEach((commit): void => {
            type = commit.getType();

            if (type) commit.setLevel(config.getLevel(type));
        });
    }

    private updateVersion(): void {
        const task = $tasks.add('Calculate release version');
        const changes: [number, number, number] = [0, 0, 0];

        this.commits.forEach((c): void => {
            changes[c.getLevel()]++;
        });

        const version = Version.update(this.version, ...changes);

        this.setVersion(version);
        task.log(`Release version: ${version}`);
        task.complete();
    }

    private async importPlugin(name: string, options: ConfigOptions, task: Task): Promise<void> {
        const module: Importable<Plugin, Context> = await import(path.resolve(__dirname, '../plugins', `${name}.js`));
        const PluginClass: Constructable<Plugin, Context> = module.default;

        task.log(`${name} plugin imported`);

        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin = new PluginClass(this);
            const subtask = task.add(`Changing state with ${PluginClass.name}`);
            const commits = [...this.commits.values()];

            if (plugin instanceof Plugin) {
                await plugin.init(options);
                await Promise.all(commits.map((commit): Promise<void> => plugin.parse(commit, subtask)));

                subtask.complete();
            } else {
                subtask.fail(`${PluginClass.name} is not Plugin class`);
            }
        } else {
            task.fail(`${PluginClass.name} is not constructor`);
        }
    }
}
