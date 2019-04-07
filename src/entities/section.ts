import Commit from './commit';
import Entity from './entity';

export default class Section extends Entity {
    private title: string;
    private commits: Map<string, Commit> = new Map();

    public constructor(title: string) {
        super(title);

        this.title = title;
    }

    public assign(commit: Commit): void {
        if (commit.isValid() && commit.isVisible()) {
            this.debug('%s: %s', this.title, commit.sha);
            this.commits.set(commit.sha, commit);
        }
    }
}
