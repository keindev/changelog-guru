import { Provider, ServiceProvider } from '../../src/providers/provider';
import { Package } from '../../src/entities/package';
import Commit from '../../src/entities/commit';
import Author from '../../src/entities/author';

class TestProvider extends Provider {
    public getRepository(): string {
        return this.repository;
    }

    public getOwner(): string {
        return this.owner;
    }

    public getBranch(): string {
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

describe('Provider', (): void => {
    it('Create (github)', (): void => {
        const provider = new TestProvider(ServiceProvider.GitHub, 'https://github.com/keindev/changelog-guru.git');

        expect(provider.type).toBe(ServiceProvider.GitHub);
        expect(provider.getRepository()).toBe('changelog-guru');
        expect(provider.getOwner()).toBe('keindev');
        expect(provider.getBranch().length).toBeGreaterThanOrEqual(3);
    });
});
