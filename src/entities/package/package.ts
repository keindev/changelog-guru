import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import * as semver from 'semver';
import { TaskTree } from 'tasktree-cli';
import { PackageDependency, DependencyType } from './dependency';

const $tasks = TaskTree.tree();

export type PackageDependencyStories = [PackageDependency | undefined, PackageDependency | undefined];

export class Package {
    public static DEFAULT_VERSION = '0.0.1';
    public static DEFAULT_LICENSE = '';
    public static DEFAULT_REPOSITORY = '';

    private data: readPkg.PackageJson;

    public constructor() {
        const task = $tasks.add('Reading package.json');

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

    public getDependenciesStories(type: DependencyType, prev: readPkg.PackageJson): PackageDependencyStories {
        const { data } = this;

        if (type === DependencyType.Engines) return [data.engines, prev.engines];
        if (type === DependencyType.Dependencies) return [data.dependencies, prev.dependencies];
        if (type === DependencyType.Dev) return [data.devDependencies, prev.devDependencies];
        if (type === DependencyType.Peer) return [data.peerDependencies, prev.peerDependencies];
        if (type === DependencyType.Optional) return [data.optionalDependencies, prev.optionalDependencies];

        return [undefined, undefined];
    }

    public async incrementVersion(major: number, minor: number, patch: number): Promise<void> {
        const task = $tasks.add(`Updating package version`);
        const current = this.getVersion();
        let next: string | undefined;

        if (major) next = semver.inc(current, 'major') || undefined;
        if (!major && minor) next = semver.inc(current, 'minor') || undefined;
        if (!major && !minor && patch) next = semver.inc(current, 'patch') || undefined;
        if (next) {
            this.data.version = next;

            // FIXME: JsonObject(writePkg) incompatible with PackageJson(readPkg)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await writePkg(this.data as any);
            task.complete(`Package version updated to ${next}`);
        } else {
            task.fail(`New package version [${next}] is invalid or less (see https://semver.org/)`);
        }
    }
}
