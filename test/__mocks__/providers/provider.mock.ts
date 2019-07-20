import { Commit } from '../../../src/entities/commit';
import { Author } from '../../../src/entities/author';
import { Package } from '../../../src/entities/package';
import { Provider } from '../../../src/providers/provider';

export class MockProvider extends Provider {
    public __getRepository(): string {
        return this.repository;
    }

    public __getOwner(): string {
        return this.owner;
    }

    public __getBranch(): string {
        return this.branch;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async getCommits(date: string, page: number): Promise<[Commit, Author][]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line class-methods-use-this
    public async getVersion(): Promise<string | undefined> {
        return Promise.resolve(Package.DEFAULT_VERSION);
    }

    // eslint-disable-next-line class-methods-use-this
    public async getLatestReleaseDate(): Promise<string> {
        return Promise.resolve(new Date(0).toISOString());
    }
}
