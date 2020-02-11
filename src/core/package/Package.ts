import writePkg from 'write-pkg';
import readPkg, { NormalizedPackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import * as semver from 'semver';

export enum DependencyRuleType {
    // https://docs.npmjs.com/files/package.json#engines
    Engines = 'engines',
    // https://docs.npmjs.com/files/package.json#dependencies
    Dependencies = 'dependencies',
    // https://docs.npmjs.com/files/package.json#devdependencies
    DevDependencies = 'devDependencies',
    // https://docs.npmjs.com/files/package.json#peerdependencies
    PeerDependencies = 'peerDependencies',
    // https://docs.npmjs.com/files/package.json#optionaldependencies
    OptionalDependencies = 'optionalDependencies',
}

export enum RestrictionRuleType {
    // https://docs.npmjs.com/files/package.json#bundleddependencies
    BundledDependencies = 'bundledDependencies',
    // https://docs.npmjs.com/files/package.json#os
    OS = 'os',
    // https://docs.npmjs.com/files/package.json#cpu
    CPU = 'cpu',
}

export default class Package {
    static DEFAULT_VERSION = '0.0.1';
    static DEFAULT_LICENSE = '';
    static DEFAULT_REPOSITORY = '';

    private data: NormalizedPackageJson;

    constructor() {
        const task = TaskTree.add('Reading package.json');

        this.data = readPkg.sync({ normalize: true });

        if (!this.data.license) task.fail('Package license is not specified');
        if (!this.data.version) task.fail('Package version is not specified');
        if (!this.data.repository) task.fail('Package repository url is not specified');

        task.log(`Version: {bold ${this.version}}`);
        task.log(`Repository: {bold ${this.repository}}`);
        task.complete('Package information:');
    }

    get repository(): string {
        const { repository } = this.data;

        if (typeof repository === 'string') return repository;
        if (typeof repository === 'object') return repository.url;

        return Package.DEFAULT_REPOSITORY;
    }

    get version(): string {
        return this.data.version ? semver.valid(semver.coerce(this.data.version)!)! : Package.DEFAULT_VERSION;
    }

    get license(): string {
        return this.data.license || Package.DEFAULT_LICENSE;
    }

    getDependencies(type: DependencyRuleType): { [key: string]: string } | undefined {
        return this.data[type];
    }

    getRestrictions(type: RestrictionRuleType): string[] | undefined {
        return this.data[type];
    }

    async incrementVersion(major: number, minor: number, patch: number): Promise<void> {
        const task = TaskTree.add(`Updating package version`);
        let next: string | null | undefined;

        if (major) next = semver.inc(this.version, 'major');
        if (!major && minor) next = semver.inc(this.version, 'minor');
        if (!major && !minor && patch) next = semver.inc(this.version, 'patch');
        if (!next) task.fail(`New package version is invalid or less (see https://semver.org/)`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await writePkg({ ...(this.data as any), version: next! });
        task.complete(`Package version updated to {bold ${next}}`);
    }
}
