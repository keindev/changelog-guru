import { TaskTree } from 'tasktree-cli';
import Commit from './entities/Commit';
import Author from './entities/Author';
import { IChange, Dependency, Restriction } from './Package';
import License from './License';
import { IPluginContext } from '../plugins/Plugin';
import PluginLoader from '../plugins/PluginLoader';
import Section from './entities/Section';

export default class State implements IPluginContext {
    protected pluginLoader = new PluginLoader();

    #sections: Section[] = [];
    #license: License | undefined;
    #authors = new Map<string, Author>();
    #commits = new Map<string, Commit>();
    #changes = new Map<Dependency | Restriction, IChange[]>();

    get sections(): Section[] {
        return this.#sections;
    }

    get authors(): Author[] {
        return [...this.#authors.values()].filter(Author.filter).sort(Author.compare);
    }

    get commits(): Commit[] {
        return [...this.#commits.values()].filter(Commit.filter).sort(Commit.compare);
    }

    addCommit(commit: Commit): void {
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

    get license(): License | undefined {
        return this.#license;
    }

    set license(license: License | undefined) {
        if (!this.#license) this.#license = license;
    }

    getChanges(type: Dependency | Restriction): IChange[] {
        return [...(this.#changes.get(type) ?? [])];
    }

    setChanges(type: Dependency | Restriction, changes: IChange[]): void {
        this.#changes.set(type, changes);
    }

    get changesLevels(): [number, number, number] {
        let major = 0;
        let minor = 0;
        let patch = 0;

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

        return [major, minor, patch];
    }

    setCommitTypes(types: [string, ChangeLevel][]): void {
        let tuple: [string, ChangeLevel] | undefined;

        this.#commits.forEach(commit => {
            if (commit.type) {
                tuple = types.find(([name]) => isSame(commit.type, name));

                if (tuple) commit.level = tuple[1];
            }
        });
    }

    addSection(name: string, position = SectionPosition.Group, order = SectionOrder.Default): Section | undefined {
        let section = this.findSection(name);

        if (!section && unify(name)) this.#sections.push(section = new Section(name, position, order));

        return section;
    }

    findSection(name: string): Section | undefined {
        return this.#sections.find((section): boolean => isSame(section.name, name));
    }

    ignoreEntities(exclusions: [ExclusionType, string[]][]): void {
        const callbacks = {
            [ExclusionType.AuthorLogin]: (rules: string[]) => this.#authors.forEach(a => rules.includes(a.name) && a.ignore());
            [ExclusionType.CommitType]: (rules: string[]) => this.#commits.forEach(c => findSame(c.type, rules) && c.ignore());
            [ExclusionType.CommitScope]: (rules: string[]) => this.#commits.forEach(c => findSame(c.scope, rules) && c.ignore());
            [ExclusionType.CommitSubject]: (rules: string[]) => this.#commits.forEach(c => rules.some(item => c.subject.includes(item)) && c.ignore());
        }

        exclusions.forEach(([type, rules]) => {
            if (!callbacks[type]) TaskTree.fail(`Unacceptable entity exclusion type - {bold ${type}}`);

            callbacks[type](rules);
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
        const relations: Map<string, Section> = new Map();
        const filter = (section: Section): boolean => Section.filter(section) && section.isSubsection;

        sections.forEach(section => {
            if (section.isGroup) {
                section.assignSubsection(relations);
            } else {
                section.assignSection(relations);
            }
        });

        this.#sections = sections.filter(filter).sort(Section.compare);
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
