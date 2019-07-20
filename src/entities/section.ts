import { Commit } from './commit';
import { Compare, Priority, Status } from '../utils/enums';

export enum Position {
    None = 0,
    Header = 1,
    Body = 2,
    Footer = 3,
    Group = 4,
    Subsection = 5,
}

export class Section {
    public readonly title: string;

    private position: Position;
    private priority = Priority.Default;
    private commits: Map<string, Commit> = new Map();
    private sections: Map<string, Section> = new Map();

    public constructor(title: string, position: Position) {
        this.title = title;
        this.position = position;
    }

    public static compare(a: Section, b: Section): number {
        let result = a.getPosition() - b.getPosition() || a.getPriority() - b.getPriority();

        if (result === Compare.Equal) result = a.title.localeCompare(b.title);

        return result;
    }

    public static filter(s: Section): boolean {
        return !(s.getPosition() === Position.Subsection || s.isEmpty());
    }

    public getPosition(): Position {
        return this.position;
    }

    public setPosition(position: Position): void {
        this.position = position;
    }

    public getSections(sort: boolean = true): Section[] {
        const sections = [...this.sections.values()];

        return sort ? sections.sort(Section.compare) : sections;
    }

    public getCommits(sort: boolean = true, onlyVisible: boolean = false): Commit[] {
        const commits = [...this.commits.values()].filter(Commit.filter);

        if (sort) commits.sort(Commit.compare);

        return onlyVisible ? commits.filter((commit): boolean => !commit.hasStatus(Status.Hidden)) : commits;
    }

    public getPriority(): number {
        if (this.priority === Priority.Default) {
            this.priority = this.getCommits().reduce(
                (acc, commit): number => acc + commit.getPriority(),
                Priority.Default
            );
        }

        return this.priority;
    }

    public add(entity: Commit | Section): void {
        if (entity instanceof Commit) this.assignEntity(entity.hash, entity, this.commits);
        if (entity instanceof Section) {
            this.assignEntity(entity.title, entity, this.sections);
            entity.setPosition(Position.Subsection);
        }
    }

    public remove(entity: Commit | Section): void {
        if (entity instanceof Commit) this.removeEntity(entity.hash, this.commits);
        if (entity instanceof Section) {
            this.removeEntity(entity.title, this.sections);
            entity.setPosition(Position.Group);
        }
    }

    public isEmpty(): boolean {
        return !this.sections.size && !this.commits.size;
    }

    public assignAsSubsection(relations: Map<string, Section>): void {
        const commits = this.getCommits();
        let parent: Section | undefined;

        if (commits.length) {
            parent = relations.get(commits[0].hash);

            if (parent) parent.add(this);

            commits.forEach((commit): void => {
                parent = relations.get(commit.hash);

                if (parent) parent.remove(commit);

                relations.set(commit.hash, this);
            });
        }
    }

    public assignAsSection(relations: Map<string, Section>): void {
        const commits = this.getCommits();

        commits.forEach((commit): void => {
            if (relations.has(commit.hash)) {
                this.remove(commit);
            } else {
                relations.set(commit.hash, this);
            }
        });
    }

    private assignEntity<T>(key: string, value: T, map: Map<string, T>): void {
        if (!map.has(key)) {
            map.set(key, value);
            this.priority = Priority.Default;
        }
    }

    private removeEntity<T>(key: string, map: Map<string, T>): void {
        if (map.has(key)) {
            map.delete(key);
            this.priority = Priority.Default;
        }
    }
}
