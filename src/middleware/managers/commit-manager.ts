import Commit from '../../entities/commit';
import Entity from '../../entities/entity';
import Process from '../../utils/process';

export default class CommitManager extends Entity {
    private commits: Map<string, Commit> = new Map();

    public add(commit: Commit): void {
        if (commit.isValid() && !this.commits.has(commit.sha)) {
            this.commits.set(commit.sha, commit);
        } else {
            this.debug('× %s', commit.url);
        }
    }

    public remove(commit: Commit, force: boolean = false): void {
        if (!commit.isImportant() || force) {
            this.debug('remove commit: %s', commit.sha);
            this.commits.delete(commit.sha);
        }
    }

    public async forEach(callback: (commit: Commit) => Promise<void>): Promise<void> {
        const promises = [...this.commits.values()].map((commit: Commit): Promise<void> => callback(commit));

        await Promise.all(promises);
    }
}
