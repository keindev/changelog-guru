import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import { Author } from './author';
import { Commit } from './commit';
import { Plugin, CommitPlugin, StatePlugin, PluginType } from './plugin';
import { ConfigurationOptions } from './configuration';
import { Section, Position } from './section';
import { Constructable, Importable } from '../utils/types';
import { Level } from '../utils/enums';
import { License } from './package/license';
import { DependencyType, Dependency } from './package/dependency';
import Key from '../utils/key';
import { ChangeLevel, ExclusionType } from '../config/typings/enums';
import { Filter } from './filter';
import { PluginOption } from '../config/typings/types';

const $tasks = TaskTree.tree();

export interface Context {
    getLicense(): License | undefined;
    getDependencies(type: DependencyType): Dependency | undefined;
    addSection(title: string, position: Position): Section | undefined;
    findSection(title: string): Section | undefined;
}

export class State implements Context {
    protected pluginsPath: string = path.resolve(__dirname, '../plugins');
    protected pluginsExtension: string = 'js';

    protected authors: Map<number, Author> = new Map();
    protected commits: Map<string, Commit> = new Map();
    protected sections: Section[] = [];
    protected license: License | undefined;
    protected dependencies: Map<DependencyType, Dependency> = new Map();

    public getSections(): Section[] {
        return this.sections;
    }

    public getAuthors(): Author[] {
        return [...this.authors.values()].filter(Author.filter).sort(Author.compare);
    }

    public getCommits(): Commit[] {
        return [...this.commits.values()].filter(Commit.filter).sort(Commit.compare);
    }

    public getLicense(): License | undefined {
        return this.license;
    }

    public getDependencies(type: DependencyType): Dependency | undefined {
        return this.dependencies.get(type);
    }

    public getChangesLevels(): [number, number, number] {
        const changes: [number, number, number] = [0, 0, 0];

        this.commits.forEach((commit): void => {
            changes[commit.getLevel() - 1]++;
        });

        return changes;
    }

    public setCommitTypes(types: [string, ChangeLevel][]): void {
        let typeName: string | undefined;
        let tuple: [string, ChangeLevel] | undefined;

        this.commits.forEach((commit): void => {
            typeName = commit.getTypeName();

            if (typeName) {
                tuple = types.find(([name]): boolean => Key.isEqual(typeName as string, name));

                if (tuple) {
                    commit.setChangeLevel(tuple[1]);
                }
            }
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

    public addSection(title: string, position: Position = Position.Group): Section | undefined {
        let section = this.findSection(title);

        if (!section && Key.unify(title)) {
            section = new Section(title, position);
            this.sections.push(section);
        }

        return section;
    }

    public setLicense(id: string, prev?: string): void {
        this.license = new License(id, prev);
    }

    public setDependencies(dependency: Dependency): void {
        this.dependencies.set(dependency.type, dependency);
    }

    public findSection(title: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.title, title));
    }

    public ignoreEntities(exclusions: [ExclusionType, string[]][]): void {
        exclusions.forEach(([type, rules]): void => {
            switch (type) {
                case ExclusionType.AuthorLogin:
                    Filter.authorsByLogin(this.authors, rules);
                    break;
                case ExclusionType.CommitType:
                    Filter.commitsByType(this.commits, rules);
                    break;
                case ExclusionType.CommitScope:
                    Filter.commitsByScope(this.commits, rules);
                    break;
                case ExclusionType.CommitSubject:
                    Filter.commitsBySubject(this.commits, rules);
                    break;
                default:
                    TaskTree.tree().fail(`Unacceptable entity exclusion type - ${type}`);
                    break;
            }
        });
    }

    public async modify(plugins: [string, PluginOption][]): Promise<void> {
        const task = $tasks.add('Modify release state');

        await Promise.all(plugins.map(([name, options]): Promise<void> => this.modifyWithPlugin(name, options, task)));
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

        this.sections = sections.filter(Section.filter).sort(Section.compare);
        task.complete();
    }

    private async modifyWithPlugin(name: string, options: ConfigurationOptions, task: Task): Promise<void> {
        const filePath = path.join(this.pluginsPath, `${name}.${this.pluginsExtension}`);

        if (fs.existsSync(filePath)) {
            const module: Importable<PluginType, Context> = await import(filePath);
            const PluginClass: Constructable<PluginType, Context> = module.default;

            task.log(`${name} plugin imported`);

            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                const plugin = new PluginClass(this);
                const subtask = task.add(`Changing state with ${PluginClass.name}`);

                if (plugin instanceof Plugin) {
                    await plugin.init(options);
                } else {
                    subtask.fail(`${PluginClass.name} is not Plugin class`);
                }

                switch (true) {
                    case plugin instanceof CommitPlugin:
                        await Promise.all(
                            [...this.commits.values()].map(
                                (commit): Promise<void> => (plugin as CommitPlugin).parse(commit, subtask)
                            )
                        );
                        break;
                    case plugin instanceof StatePlugin:
                        await (plugin as StatePlugin).modify(subtask);
                        break;
                    default:
                        subtask.fail(`${PluginClass.name} - state modification with this plugin is not available yet`);
                        break;
                }

                subtask.complete();
            } else {
                task.fail(`${name} is not constructor`);
            }
        } else {
            task.fail(`Plugin ${name} not found`);
        }
    }
}
