import writePkg from 'write-pkg';
import readPkg from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import * as semver from 'semver';

export enum Dependency {
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

export enum Restriction {
    // https://docs.npmjs.com/files/package.json#bundleddependencies
    BundledDependencies = 'bundledDependencies',
    // https://docs.npmjs.com/files/package.json#os
    OS = 'os',
    // https://docs.npmjs.com/files/package.json#cpu
    CPU = 'cpu',
}

export default class Package {
    #rules = new Map<Dependency | Restriction, Rule>();
    #data: readPkg.NormalizedPackageJson;

    constructor() {
        const task = TaskTree.add('Reading package.json');

        this.#data = readPkg.sync({ normalize: true });

        if (!this.#data.license) task.fail('Package license is not specified');
        if (!this.#data.version) task.fail('Package version is not specified');
        if (!this.#data.repository) task.fail('Package repository url is not specified');

        task.log(`Version: {bold ${this.version}}`);
        task.log(`Repository: {bold ${this.repository}}`);
        task.complete('Package information:');
    }

    get repository(): string {
        return typeof this.#data.repository === 'object' ? this.#data.repository.url : this.#data.repository!;
    }

    get version(): string {
        return semver.valid(semver.coerce(this.#data.version)!)!;
    }

    get license(): string {
        return this.#data.license!;
    }

    getDependencies(type: Dependency): { [key: string]: string } | undefined {
        return this.#data[type];
    }

    getRestrictions(type: Restriction): string[] | undefined {
        return this.#data[type];
    }

    async bump(major: number, minor: number, patch: number): Promise<void> {
        const task = TaskTree.add(`Updating package version`);
        let next: string | null | undefined;

        if (major) next = semver.inc(this.version, 'major');
        if (!major && minor) next = semver.inc(this.version, 'minor');
        if (!major && !minor && patch) next = semver.inc(this.version, 'patch');
        if (!next) task.fail(`New package version is invalid or less (see https://semver.org/)`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await writePkg({ ...(this.#data as any), version: next! });
        task.complete(`Package version updated to {bold ${next}}`);
    }
}
