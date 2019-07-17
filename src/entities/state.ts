import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Key from '../utils/key';
import { ConfigurationOptions } from './configuration';
import Section, { Position } from './section';
import { Constructable, Importable } from '../utils/types';
import { Level } from '../utils/enums';

const $tasks = TaskTree.tree();

export interface Context {
    addSection(title: string, position: Position): Section;
    findSection(title: string): Section | undefined;
}

export default class State implements Context {
    protected pluginsPath: string = path.resolve(__dirname, '../plugins');
    protected pluginsExtension: string = 'js';

    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];

    public getSections(): Section[] {
        return this.sections;
    }

    public getAuthors(): Author[] {
        return [...this.authors.values()].filter(Author.filter).sort(Author.compare);
    }

    public getChangesLevels(): [number, number, number] {
        const changes: [number, number, number] = [0, 0, 0];

        this.commits.forEach((commit): void => {
            changes[commit.getLevel() - 1]++;
        });

        return changes;
    }

    public setLevels(levels: Map<string, Level>): void {
        let type: string | undefined;

        this.commits.forEach((commit): void => {
            type = commit.getType();
            commit.setLevel(type ? Key.inMap(type, levels) || Level.Patch : Level.Patch);
        });
    }

    public addCommit(commit: Commit, author: Author): void {
        const { commits, authors } = this;

        if (!commits.has(commit.hash)) {
            commits.set(commit.hash, commit);

            if (authors.has(author.id)) {
                author.increaseContribution();
            } else {
                authors.set(author.id, author);
            }
        }
    }

    public addSection(title: string, position: Position = Position.Group): Section {
        let section = this.findSection(title);

        if (!section) {
            section = new Section(title, position);
            this.sections.push(section);
        }

        return section;
    }

    public findSection(title: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.title, title));
    }

    public ignoreAuthors(filters: string[]): void {
        this.authors.forEach((author): void => {
            if (filters.indexOf(author.login) >= 0) {
                author.ignore();
            }
        });
    }

    public ignoreCommits(types: string[], scopes: string[], subjects: string[]): void {
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

    public async modify(plugins: string[], options: ConfigurationOptions): Promise<void> {
        const task = $tasks.add('Modify release state');

        await Promise.all(plugins.map((plugin): Promise<void> => this.modifyWithPlugin(plugin, options, task)));
        this.rebuildSectionsTree();
        task.complete();
    }

    private rebuildSectionsTree(): void {
        const task = $tasks.add('Rebuild sections tree');
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach((section): void => {
                if (section.getPosition() === Position.Group) {
                    section.assignAsSubsection(relations);
                } else {
                    section.assignAsSection(relations);
                }
            });
        }

        this.sections = sections
            .filter(Section.filter)
            .sort(Section.compare)
            .reverse();
        task.complete();
    }

    private async modifyWithPlugin(name: string, options: ConfigurationOptions, task: Task): Promise<void> {
        const filePath = path.join(this.pluginsPath, `${name}.${this.pluginsExtension}`);

        if (fs.existsSync(filePath)) {
            const module: Importable<Plugin, Context> = await import(filePath);
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
        } else {
            task.fail(`Plugin ${name} not found`);
        }
    }
}
