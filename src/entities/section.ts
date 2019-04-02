import Commit from './commit';

export default class Section {
    private name: string;
    private commits: Map<number, Commit> = new Map();

    public constructor(name: string) {
        this.name = name;
    }

    public assign(commit: Commit): void {
        if (commit.isValid() && commit.isVisible()) {
            this.commits.set(commit.timestamp, commit);
        }
    }
}
