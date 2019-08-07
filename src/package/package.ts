import writePkg from 'write-pkg';
import readPkg, { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import * as semver from 'semver';
import { PackageDependenciesStory, PackageRestrictionsStory } from './typings/types';
import { DependencyRuleType, RestrictionRuleType } from './rules/typings/enums';

export class Package {
    public static DEFAULT_VERSION = '0.0.1';
    public static DEFAULT_LICENSE = '';
    public static DEFAULT_REPOSITORY = '';

    private data: PackageJson;

    public constructor() {
        const task = TaskTree.tree().add('Reading package.json');

        this.data = readPkg.sync({ normalize: false });

        if (!this.data.license) task.fail('Package license is not specified');
        if (!this.data.version) task.fail('Package version is not specified');
        if (!this.data.repository) task.fail('Package repository url is not specified');

        task.log(`Version: ${this.getVersion()}`);
        task.log(`Repository: ${this.getRepository()}`);
        task.complete('Package information:');
    }

    public getRepository(): string {
        const {
            data: { repository },
        } = this;

        if (typeof repository === 'string') return repository;
        if (typeof repository === 'object') return repository.url;

        return Package.DEFAULT_REPOSITORY;
    }

    public getVersion(): string {
        const { version } = this.data;

        return version
            ? semver.valid(semver.coerce(version) || Package.DEFAULT_VERSION) || Package.DEFAULT_VERSION
            : Package.DEFAULT_VERSION;
    }

    public getLicense(): string {
        return this.data.license || Package.DEFAULT_LICENSE;
    }

    public getDependenciesStory(type: DependencyRuleType, prevState: readPkg.PackageJson): PackageDependenciesStory {
        const { data } = this;
        let result: PackageDependenciesStory | undefined;

        switch (type) {
            case DependencyRuleType.Engines:
                result = [data.engines, prevState.engines];
                break;
            case DependencyRuleType.Dependencies:
                result = [data.dependencies, prevState.dependencies];
                break;
            case DependencyRuleType.DevDependencies:
                result = [data.devDependencies, prevState.devDependencies];
                break;
            case DependencyRuleType.PeerDependencies:
                result = [data.peerDependencies, prevState.peerDependencies];
                break;
            case DependencyRuleType.OptionalDependencies:
                result = [data.optionalDependencies, prevState.optionalDependencies];
                break;
            default:
                TaskTree.tree().fail(`Unexpected dependency group type: ${type}`);
                break;
        }

        return result as PackageDependenciesStory;
    }

    public getRestrictionsStory(type: RestrictionRuleType, prevState: readPkg.PackageJson): PackageRestrictionsStory {
        const { data } = this;
        let result: PackageRestrictionsStory | undefined;

        switch (type) {
            case RestrictionRuleType.BundledDependencies:
                result = [data.bundledDependencies, prevState.bundledDependencies];
                break;
            case RestrictionRuleType.CPU:
                result = [data.cpu, prevState.cpu];
                break;
            case RestrictionRuleType.OS:
                result = [data.os, prevState.os];
                break;
            default:
                TaskTree.tree().fail(`Unexpected restriction group type: ${type}`);
                break;
        }

        return result as PackageRestrictionsStory;
    }

    public async incrementVersion(major: number, minor: number, patch: number): Promise<void> {
        const task = TaskTree.tree().add(`Updating package version`);
        const current = this.getVersion();
        let next: string | undefined;

        if (major) next = semver.inc(current, 'major') || undefined;
        if (!major && minor) next = semver.inc(current, 'minor') || undefined;
        if (!major && !minor && patch) next = semver.inc(current, 'patch') || undefined;
        if (next) {
            this.data.version = next;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await writePkg(this.data as any);
            task.complete(`Package version updated to ${next}`);
        } else {
            task.fail(`New package version [${next}] is invalid or less (see https://semver.org/)`);
        }
    }
}
