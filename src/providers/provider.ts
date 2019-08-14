import { PackageJson } from 'read-pkg';
import { Commit } from '../entities/commit';
import { ServiceProvider } from '../config/config';

export interface ReleaseInfo {
    tag: string | undefined;
    date: string;
}

export abstract class Provider {
    public static PAGE_SIZE = 100;

    public readonly type: ServiceProvider;

    public constructor(type: ServiceProvider) {
        this.type = type;
    }

    abstract async getLastRelease(): Promise<ReleaseInfo>;
    abstract async getCommits(date: string, page: number): Promise<Commit[]>;
    abstract async getCommitsCount(date: string): Promise<number>;
    abstract async getPrevPackage(): Promise<PackageJson>;
}
