import writePkg from 'write-pkg';
import readPkg, { PackageJson } from 'read-pkg';
import { TaskTree } from 'tasktree-cli';
import { valid, coerce, compare, inc, SemVer } from 'semver';
import { Compare } from './entities/Entity';

export enum ChangeType {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}

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

export interface IChange {
    name: string;
    type: ChangeType;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;
}

const getRestrictionName = (name: string): string => {
    return (name[0] === '!' ? name.slice(1) : name);
};
const getDependencyLink = (type: Dependency, name: string, ver?: string): string | undefined =>  {
    return type !== Dependency.Engines && ver ? `https://www.npmjs.com/package/${name}/v/${ver}` : undefined
};
const versionChanges: { [key: number]: ChangeType } = {
    [Compare.Less]: ChangeType.Bumped,
    [Compare.More]: ChangeType.Downgraded,
    [Compare.Equal]: ChangeType.Unchanged,
};
const restrictionChanges: { [key: number]: ChangeType } = {
    [Compare.Less]: ChangeType.Changed,
    [Compare.More]: ChangeType.Changed,
    [Compare.Equal]: ChangeType.Unchanged
};

export default class Package {
    #data: PackageJson;

    constructor() {
        const task = TaskTree.add('Reading package.json');

        this.#data = readPkg.sync({ normalize: false });

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
        return valid(coerce(this.#data.version)!)!;
    }

    get license(): string {
        return this.#data.license!;
    }

    getDependenciesChanges(property: Dependency, prevDeps: Map<string, string>): IChange[] {
        const changes: IChange[] = [];
        const currDeps = this.#data[property];

        if (currDeps) {
            Object.entries(currDeps).forEach(([value, name]) => {
                const version = coerce(value);

                if (version) {
                    const prevValue = prevDeps.get(name);
                    const prevVersion = coerce(prevValue) ?? undefined;
                    const type = prevVersion ? versionChanges[compare(version, prevVersion)] : ChangeType.Added;
                    const link = getDependencyLink(property, name, version.version);

                    changes.set(name, { name, value, type, version, link, prevValue, prevVersion });
                    prevDeps.delete(name);
                }
            });

            prevDeps.forEach((prevValue, name) => {
                const prevVersion = coerce(prevValue)!;
                const link = getDependencyLink(property, name, prevVersion?.version);

                changes.set(name, { name, type: ChangeType.Removed, link, prevValue, prevVersion });
            });
        }

        return [...changes.values()];
    }

    getRestrictionsChanges(property: Restriction, prevRestrictions: string[]): IChange[] {
        const changes: IChange[] = [];
        const currRestrictions = this.#data[property];

        if (currRestrictions) {
            const restrictions = [...prevRestrictions];

            currRestrictions.forEach(value => {
                const index = restrictions.indexOf(value);
                const prevValue = restrictions[index];
                const type = prevValue ? restrictionChanges[value.localeCompare(prevValue)] : ChangeType.Added;

                if (prevValue) restrictions.splice(index, 1);

                changes.push({ name: getRestrictionName(value), value, type, prevValue });
            });

            changes.push(...restrictions.map(prevValue => ({ name: getRestrictionName(prevValue), type: ChangeType.Removed, prevValue })));
        }

        return [...changes.values()];
    }

    async bump(major: number, minor: number, patch: number): Promise<void> {
        const task = TaskTree.add(`Updating package version`);
        let next: string | null | undefined;

        if (major) next = inc(this.version, 'major');
        if (!major && minor) next = inc(this.version, 'minor');
        if (!major && !minor && patch) next = inc(this.version, 'patch');
        if (!next) task.fail(`New package version is invalid or less (see https://semver.org/)`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await writePkg({ ...(this.#data as any), version: next! });
        task.complete(`Package version updated to {bold ${next}}`);
    }
}
