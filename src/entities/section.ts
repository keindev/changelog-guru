import Commit from './commit';

export enum Position {
    Header = 1,
    Body = 2,
    Footer = 3,
    Group = 4,
    Subsection = 5
}

export default class Section {
    public static DEFAULT_WEIGHT = 0;

    public readonly title: string;

    private position: Position;
    private weight = Section.DEFAULT_WEIGHT;
    private commits: Map<string, Commit> = new Map();
    private sections: Map<string, Section> = new Map();

    public static compare(a: Section, b: Section): number {
        let result = Math.max(1, Math.min(-1, a.getPosition() - b.getPosition() || a.getWeight() - b.getWeight()));

        if (result === 0) result = a.title.localeCompare(b.title);

        return result;
    }

    public constructor(title: string, position: Position) {
        this.title = title;
        this.position = position;
    }

    public assign(entity: Commit | Section): void {
        if (entity instanceof Commit) this.assignEntity(entity.sha, entity, this.commits);
        if (entity instanceof Section) {
            this.assignEntity(entity.title, entity, this.sections);
            entity.setPosition(Position.Subsection);
        }
    }

    public remove(entity: Commit | Section): void {
        if (entity instanceof Commit) this.removeEntity(entity.sha, this.commits);
        if (entity instanceof Section) {
            this.removeEntity(entity.title, this.sections);
            entity.setPosition(Position.Group);
        }
    }

    public getPosition(): Position {
        return this.position;
    }

    public setPosition(position: Position): void {
        const check = (p: Position): boolean => p === Position.Group || p === Position.Subsection;

        if (check(position) && check(this.position)) this.position = position;
    }

    public getWeight(): number {
        if (this.weight === Section.DEFAULT_WEIGHT) {
            this.commits.forEach(
                (commit: Commit): void => {
                    this.weight += commit.getWeight();
                }
            );
        }

        return this.weight;
    }

    public getFirstCommit(): Commit | undefined {
        let commit: Commit | undefined;

        if (this.commits.size) commit = this.getCommits().shift();

        return commit;
    }

    public getCommits(): Commit[] {
        return [...this.commits.values()].sort((a, b): number => a.timestamp - b.timestamp);
    }

    private assignEntity<T>(key: string, value: T, map: Map<string, T>): void {
        if (!map.has(key)) {
            map.set(key, value);
            this.weight = Section.DEFAULT_WEIGHT;
        }
    }

    private removeEntity<T>(key: string, map: Map<string, T>): void {
        if (map.has(key)) {
            map.delete(key);
            this.weight = Section.DEFAULT_WEIGHT;
        }
    }
}
