import fs from 'fs';
import path from 'path';
import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import { ChangeLevel, ExclusionType } from '../config/typings/enums';
import { Filter } from './filter';
import { PluginOption } from '../config/typings/types';
import { StateContext } from './typings/types';
import { DependencyType } from '../package/typings/enums';
import { Dependency } from '../package/dependency';
import { Commit } from '../entities/commit';
import { Author } from '../entities/author';
import { Section } from '../entities/section';
import { License } from '../package/license';
import { SectionPosition } from '../entities/typings/enums';
import { BasePlugin } from '../plugins/base-plugin';
import { CommitPlugin } from '../plugins/commit-plugin';
import { StatePlugin } from '../plugins/state-plugin';
import Key from '../utils/key';
import { PluginType, ImportablePlugin, ConstructablePlugin } from '../plugins/typings/types';

export class State implements StateContext {
    protected pluginsPath: string = path.resolve(__dirname, '../plugins/implementations');
    protected pluginsExtension: string = 'js';

    protected authors: Map<string, Author> = new Map();
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

    public addCommit(commit: Commit): void {
        const { commits, authors } = this;

        if (!commits.has(commit.getName())) {
            const { author } = commit;

            commits.set(commit.getName(), commit);

            if (authors.has(author.getName())) {
                author.increaseContribution();
            } else {
                authors.set(author.getName(), author);
            }
        }
    }

    public getLicense(): License | undefined {
        return this.license;
    }

    public setLicense(id: string, prev?: string): void {
        this.license = new License(id, prev);
    }

    public getDependencies(type: DependencyType): Dependency | undefined {
        return this.dependencies.get(type);
    }

    public setDependencies(dependency: Dependency): void {
        this.dependencies.set(dependency.type, dependency);
    }

    public getChangesLevels(): [number, number, number] {
        let major = 0;
        let minor = 0;
        let patch = 0;

        this.commits.forEach((commit): void => {
            switch (commit.getChangeLevel()) {
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
                    TaskTree.tree().fail(`Incompatible ChangeLevel - ${commit.getChangeLevel()}`);
                    break;
            }
        });

        return [major, minor, patch];
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

    public addSection(name: string, position: SectionPosition = SectionPosition.Group): Section | undefined {
        let section = this.findSection(name);

        if (!section && Key.unify(name)) {
            section = new Section(name, position);
            this.sections.push(section);
        }

        return section;
    }

    public findSection(name: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.getName(), name));
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
        const task = TaskTree.tree().add('Modifying release state...');

        await Promise.all(plugins.map(([name, options]): Promise<void> => this.modifyWithPlugin(name, options, task)));
        this.rebuildSectionsTree();
        task.complete('Release status modified');
    }

    private rebuildSectionsTree(): void {
        const task = TaskTree.tree().add('Bringing the section tree to a consistent state...');
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach((section): void => {
                if (section.getPosition() === SectionPosition.Group) {
                    section.assignAsSubsection(relations);
                } else {
                    section.assignAsSection(relations);
                }
            });
        }

        this.sections = sections
            .filter(Section.filter)
            .filter((section): boolean => section.getPosition() !== SectionPosition.Subsection)
            .sort(Section.compare);
        task.complete('Section tree is consistently');
    }

    // TODO: think about it, maybe you should add a PluginLoader?
    private async modifyWithPlugin(name: string, options: PluginOption, task: Task): Promise<void> {
        const filePath = path.join(this.pluginsPath, name, `${name}.${this.pluginsExtension}`);

        if (fs.existsSync(filePath)) {
            const module: ImportablePlugin<PluginType, StateContext> = await import(filePath);
            const PluginClass: ConstructablePlugin<PluginType, StateContext> = module.default;

            task.log(`${name} plugin imported`);

            if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
                const plugin = new PluginClass(this);
                const subtask = task.add(`Changing state with ${PluginClass.name}`);

                if (plugin instanceof BasePlugin) {
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
                throw new Error('2222');
                // task.fail(`${name} is not constructor`);
            }
        } else {
            throw new Error(`${1111} ${filePath}`);
            // task.fail(`Plugin ${name} not found`);
        }
    }
}
