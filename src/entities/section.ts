import Commit from './commit';

export enum Position {
    Header = 1,
    Body = 2,
    Footer = 3,
    Group = 4,
    Subgroup = 5
}

export default class Section {
    public static DEFAULT_WEIGHT = 0;

    public readonly title: string;
    public readonly position: Position;

    private weight = Section.DEFAULT_WEIGHT;
    private relations: Map<string, Commit> = new Map();

    public constructor(title: string, position?: Position) {
        this.title = title;
        this.position = position || Position.Subgroup;
    }

    public assign(commit: Commit): void {
        const { relations } = this;

        if (!relations.has(commit.sha)) {
            relations.set(commit.sha, commit);
            this.weight = Section.DEFAULT_WEIGHT;
        }
    }

    public getWeight(): number {
        if (this.weight === Section.DEFAULT_WEIGHT) {
            this.getRelations().forEach(
                (commit: Commit): void => {
                    this.weight += commit.getWeight();
                }
            );
        }

        return this.weight;
    }

    public getRelations(): Commit[] {
        return [...this.relations.values()];
    }
}
