import { PackageJson } from 'read-pkg';
import Commit from '../entities/Commit';
import { ServiceProvider } from '../config/Config';

export interface IReleaseInfo {
    tag: string | undefined;
    date: Date;
}

export default abstract class Provider {
    public static PAGE_SIZE = 100;

    public readonly type: ServiceProvider;

    public constructor(type: ServiceProvider) {
        this.type = type;
    }

    abstract async getLastRelease(): Promise<IReleaseInfo>;
    abstract async getCommits(date: Date, page: number): Promise<Commit[]>;
    abstract async getCommitsCount(date: Date): Promise<number>;
    abstract async getPrevPackage(): Promise<PackageJson>;
}
