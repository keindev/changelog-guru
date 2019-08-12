import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import { Filter } from './filter';
import { Commit } from '../entities/commit';
import { Author } from '../entities/author';
import { Section, SectionPosition } from '../entities/section';
import { License } from '../package/license';
import { CommitPlugin } from '../plugins/commit-plugin';
import { StatePlugin } from '../plugins/state-plugin';
import Key from '../utils/key';
import { PackageRule, PackageRuleType } from '../package/rules/package-rule';
import { ChangeLevel, ExclusionType, PluginOption } from '../config/config';
import { PluginLoader } from '../plugins/plugin-loader';

export interface StateContext {
    getLicense(): License | undefined;
    getPackageRule(type: PackageRuleType): PackageRule | undefined;
    addSection(title: string, position: SectionPosition): Section | undefined;
    findSection(title: string): Section | undefined;
}

export class State implements StateContext {
    protected pluginLoader: PluginLoader = new PluginLoader();

    private authors: Map<string, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private license: License | undefined;
    private rules: Map<PackageRuleType, PackageRule> = new Map();

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

    public getPackageRule(type: PackageRuleType): PackageRule | undefined {
        return this.rules.get(type);
    }

    public setPackageRule(rule: PackageRule): void {
        this.rules.set(rule.getType(), rule);
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
                    TaskTree.fail(`Incompatible ChangeLevel - {bold ${commit.getChangeLevel()}}`);
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
                    TaskTree.fail(`Unacceptable entity exclusion type - {bold ${type}}`);
                    break;
            }
        });
    }

    public async modify(plugins: [string, PluginOption][]): Promise<void> {
        const task = TaskTree.add('Modifying release state...');

        await Promise.all(plugins.map(([name, options]): Promise<void> => this.modifyWithPlugin(name, options, task)));
        this.rebuildSectionsTree();
        task.complete('Release status modified');
    }

    private rebuildSectionsTree(): void {
        const task = TaskTree.add('Bringing the section tree to a consistent state...');
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

    private async modifyWithPlugin(name: string, config: PluginOption, task: Task): Promise<void> {
        const plugin = await this.pluginLoader.load(task, {
            name,
            config,
            context: this,
        });

        switch (true) {
            case plugin instanceof CommitPlugin:
                await Promise.all(
                    [...this.commits.values()].map(
                        (commit): Promise<void> => (plugin as CommitPlugin).parse(commit, task)
                    )
                );
                break;
            case plugin instanceof StatePlugin:
                await (plugin as StatePlugin).modify(task);
                break;
            default:
                task.fail(`{bold ${plugin.constructor.name}} - plugin is not available yet`);
                break;
        }
    }
}
