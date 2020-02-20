import { TaskTree } from 'tasktree-cli';
import { Task } from 'tasktree-cli/lib/task';
import Commit from '../entities/Commit';
import Author from '../entities/Author';
import Section, { SectionPosition, SectionOrder } from '../entities/Section';
import License from '../package/License';
import { isSame, findSame, unify } from '../../utils/Text';
import PackageRule, { PackageRuleType } from '../package/rules/PackageRule';
import { ChangeLevel, ExclusionType, IPluginOption } from '../config/Config';
import PluginLoader from '../../plugins/PluginLoader';
import { IPluginContext } from '../../plugins/Plugin';

export default class State implements IPluginContext {
    protected pluginLoader = new PluginLoader();

    private authors = new Map<string, Author>();
    private commits = new Map<string, Commit>();
    private sections: Section[] = [];
    private license: License | undefined;
    private rules: Map<PackageRuleType, PackageRule> = new Map();

    get sections(): Section[] {
        return this.sections;
    }

    get authors(): Author[] {
        return [...this.authors.values()].filter(Author.filter).sort(Author.compare);
    }

    get commits(): Commit[] {
        return [...this.commits.values()].filter(Commit.filter).sort(Commit.compare);
    }

    addCommit(commit: Commit): void {
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

    get license(): License | undefined {
        return this.license;
    }

    set license(id: string, prev?: string) {
        this.license = new License(id, prev);
    }

    getPackageRule(type: PackageRuleType): PackageRule | undefined {
        return this.rules.get(type);
    }

    setPackageRule(rule: PackageRule): void {
        this.rules.set(rule.getType(), rule);
    }

    get changesLevels(): [number, number, number] {
        let major = 0;
        let minor = 0;
        let patch = 0;

        this.commits.forEach(commit => {
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
            }
        });

        return [major, minor, patch];
    }

    setCommitTypes(types: [string, ChangeLevel][]): void {
        let typeName: string | undefined;
        let tuple: [string, ChangeLevel] | undefined;

        this.commits.forEach(commit => {
            typeName = commit.getTypeName();

            if (typeName) {
                tuple = types.find(([name]) => isSame(typeName as string, name));

                if (tuple) commit.setChangeLevel(tuple[1]);
            }
        });
    }

    addSection(name: string, position = SectionPosition.Group, order = SectionOrder.Default): Section | undefined {
        let section = this.findSection(name);

        if (!section && unify(name)) {
            section = new Section(name, position);
            section.setOrder(order);
            this.sections.push(section);
        }

        return section;
    }

    findSection(name: string): Section | undefined {
        return this.sections.find((section): boolean => isSame(section.name, name));
    }

    ignoreEntities(exclusions: [ExclusionType, string[]][]): void {
        const { authors, commits } = this;

        exclusions.forEach(([type, rules]) => {
            switch (type) {
                case ExclusionType.AuthorLogin:
                    authors.forEach(author => author.ignore(rules.indexOf(author.login) >= 0));
                    break;
                case ExclusionType.CommitType:
                    commits.forEach(commit => commit.ignore(findSame(commit.getTypeName(), rules)));
                    break;
                case ExclusionType.CommitScope:
                    commits.forEach(commit => commit.ignore(findSame(commit.getScope(), rules)));
                    break;
                case ExclusionType.CommitSubject:
                    commits.forEach(commit => commit.ignore(rules.some(item => commit.getSubject().includes(item))));
                    break;
                default:
                    TaskTree.fail(`Unacceptable entity exclusion type - {bold ${type}}`);
            }
        });
    }

    async modify(plugins: [string, IPluginOption][]): Promise<void> {
        const task = TaskTree.add('Modifying release state...');

        await Promise.all(plugins.map(([name, options]) => this.modifyWithPlugin(name, options, task)));
        this.rebuildSectionsTree();
        task.complete('Release status modified');
    }

    private rebuildSectionsTree(): void {
        const task = TaskTree.add('Bringing the section tree to a consistent state...');
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach(section => {
                if (section.position === SectionPosition.Group) {
                    section.assignAsSubsection(relations);
                } else {
                    section.assignAsSection(relations);
                }
            });
        }

        this.sections = sections
            .filter(Section.filter)
            .filter(section => section.position !== SectionPosition.Subsection)
            .sort(Section.compare);
        task.complete('Section tree is consistently');
    }

    private async modifyWithPlugin(name: string, config: IPluginOption, task: Task): Promise<void> {
        const plugin = await this.pluginLoader.load(task, { name, config, context: this });

        if (plugin.parse) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await Promise.all([...this.commits.values()].map(commit => plugin.parse!(commit, task)));
        }

        if (plugin.modify) await plugin.modify(task);
    }
}
