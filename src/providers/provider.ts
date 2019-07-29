import { PackageJson } from 'read-pkg';
import { Commit } from '../entities/commit';
import { ReleaseInfo } from './typings/types';
import { ServiceProvider } from '../config/typings/enums';

export abstract class Provider {
    public static PAGE_SIZE: number = 100;

    public readonly type: ServiceProvider;

    public constructor(type: ServiceProvider) {
        this.type = type;
    }

    abstract async getLastRelease(): Promise<ReleaseInfo>;
    abstract async getCommits(page: number): Promise<Commit[]>;
    abstract async getPrevPackage(): Promise<PackageJson>;
}
