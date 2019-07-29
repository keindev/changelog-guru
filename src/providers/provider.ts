import { PackageJson } from 'read-pkg';
import { Commit } from '../entities/commit';
import { Author } from '../entities/author';
import { ReleaseInfo } from './typings/types';
import { ServiceProvider } from '../config/typings/enums';

export abstract class Provider {
    public readonly type: ServiceProvider;

    public constructor(type: ServiceProvider) {
        this.type = type;
    }

    abstract async getLastRelease(): Promise<ReleaseInfo>;
    abstract async getCommits(page: number): Promise<[Commit, Author][]>;
    abstract async getPrevPackage(): Promise<PackageJson>;
}
