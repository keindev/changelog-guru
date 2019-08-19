import { PackageJson } from 'read-pkg';
import { Commit } from '../../../src/entities/commit';
import { Author } from '../../../src/entities/author';
import { GitProvider } from '../../../src/providers/git-provider';
import { Package } from '../../../src/package/package';
import { ServiceProvider } from '../../../src/config/config';
import { ReleaseInfo } from '../../../src/providers/provider';

export class MockProvider extends GitProvider {
    public readonly __author: Author;
    public readonly __commit: Commit;

    public constructor(type: ServiceProvider, url: string) {
        super(type, url);

        this.__author = new Author('keindev', {
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });

        this.__commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19ff', {
            timestamp: 1,
            header: 'feat(Jest): subject',
            body: '\n\nbody\n\nfooter',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19ff',
            author: this.__author,
        });
    }

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
    public async getCommits(date: string, page: number): Promise<Commit[]> {
        return Promise.resolve([this.__commit]);
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    public async getCommitsCount(date: string): Promise<number> {
        return Promise.resolve(1);
    }

    // eslint-disable-next-line class-methods-use-this
    public async getLastRelease(): Promise<ReleaseInfo> {
        return Promise.resolve({
            tag: Package.DEFAULT_VERSION,
            date: new Date(0).toISOString(),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async getPrevPackage(): Promise<PackageJson> {
        return Promise.resolve({
            license: 'MIT',
        });
    }
}
