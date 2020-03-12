import { TaskTree } from 'tasktree-cli';
import Commit from './entities/Commit';
import Author from './entities/Author';
import { IChange, Dependency, Restriction } from './Package';
import License from './License';
import { IContext, IPlugin } from '../plugins/Plugin';
import Section, { Position, Order } from './entities/Section';
import { ChangeLevel } from './entities/Entity';
import { isSame, unify, findSame } from '../utils/Text';

export enum ExclusionType {
    AuthorLogin = 'authorLogin',
    CommitType = 'commitType',
    CommitScope = 'commitScope',
    CommitSubject = 'commitSubject',
}

export default class State implements IContext {
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

    updateCommitsChangeLevel(types: [string, ChangeLevel][]): void {
        this.#commits.forEach(commit => {
            const [, level] = types.find(([name]) => isSame(commit.type, name)) ?? [];

            if (level) commit.level = level;
        });
    }

    addSection(name: string, position = Position.Group, order = Order.Default): Section | undefined {
        let section = this.findSection(name);

        if (!section && unify(name)) this.#sections.push(section = new Section(name, position, order));

        return section;
    }

    findSection(name: string): Section | undefined {
        return this.#sections.find((section): boolean => isSame(section.name, name));
    }

    ignoreEntities(exclusions: [ExclusionType, string[]][]): void {
        const callbacks = {
            [ExclusionType.AuthorLogin]: (rules: string[]) => this.#authors.forEach(author => rules.includes(author.name) && author.ignore());
            [ExclusionType.CommitType]: (rules: string[]) => this.#commits.forEach(commit => findSame(commit.type, rules) && commit.ignore());
            [ExclusionType.CommitScope]: (rules: string[]) => this.#commits.forEach(commit => commit.scope && findSame(commit.scope, rules) && commit.ignore());
            [ExclusionType.CommitSubject]: (rules: string[]) => this.#commits.forEach(commit => rules.some(item => commit.subject.includes(item)) && commit.ignore());
        }

        exclusions.forEach(([type, rules]) => {
            if (!callbacks[type]) TaskTree.fail(`Unacceptable entity exclusion type - {bold ${type}}`);

            callbacks[type](rules);
        });
    }

    async modify(plugins: IPlugin[]): Promise<void> {
        const task = TaskTree.add('Modifying release state...');

        plugins.forEach((plugin) => {
            if (plugin.parse) this.commits.forEach((commit) => plugin.parse!(commit));
            if (plugin.modify) plugin.modify(task);
        });

        const subtask = task.add('Bringing the section tree to a consistent state...');
        const sections = this.sections.sort(Section.compare);
        const relations: Map<string, Section> = new Map();

        sections.forEach(section => {
            if (section.isGroup) {
                section.assignSubsection(relations);
            } else {
                section.assignSection(relations);
            }
        });

        this.#sections = sections.filter((section): boolean => Section.filter(section) && section.isSubsection).sort(Section.compare);
        subtask.complete('Section tree is consistently');
        task.complete('Release status modified');
    }
}
