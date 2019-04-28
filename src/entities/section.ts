import Commit from './commit';

export enum Position {
    Header = 1,
    Body = 2,
    Footer = 3,
    Group = 4,
    Subgroup = 5
}

export default class Section {
    public readonly title: string;
    public readonly position: Position;

    private relations: Set<string> = new Set();
    private commits: Commit[] = [];

    public constructor(title: string, position?: Position) {
        this.title = title;
        this.position = position || Position.Subgroup;
    }

    public assign(commit: Commit): void {
        const { relations } = this;

        if (!relations.has(commit.sha)) {
            relations.add(commit.sha);
            this.commits.push(commit);
        }
    }
}
