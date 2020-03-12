import { PackageJson } from 'read-pkg';
import Commit from '../entities/Commit';
import GitProvider from './GitProvider';
import { IReleaseInfo, ServiceProvider } from './Provider';

export default class GitLabProvider extends GitProvider {
    constructor(url: string, branch?: string) {
        super(ServiceProvider.GitHub, url, branch);
    }

    // eslint-disable-next-line class-methods-use-this
    async getCommits(date: Date, pageIndex: number): Promise<Commit[]> {
        return [];
    }

    // eslint-disable-next-line class-methods-use-this
    async getCommitsCount(date: Date): Promise<number> {
        return 0;
    }

    // eslint-disable-next-line class-methods-use-this
    async getLastRelease(): Promise<IReleaseInfo> {
        return { tag: undefined, date: new Date(0) };
    }

    // eslint-disable-next-line class-methods-use-this
    async getPrevPackage(): Promise<PackageJson> {
        return {};
    }
}
