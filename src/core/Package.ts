import readPkg, { PackageJson } from 'read-pkg';
import { coerce, compare, inc, SemVer, valid } from 'semver';
import { TaskTree } from 'tasktree-cli';
import writePkg from 'write-pkg';

import { Compare } from './entities/Entity';

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

export enum DependencyChangeType {
  Added = 'added',
  Bumped = 'bumped',
  Changed = 'changed',
  Downgraded = 'downgraded',
  Removed = 'removed',
  Unchanged = 'unchanged',
}

const VERSION_CHANGES_MAP = {
  [Compare.Less]: DependencyChangeType.Downgraded,
  [Compare.More]: DependencyChangeType.Bumped,
  [Compare.Equal]: DependencyChangeType.Unchanged,
};
const RESTRICTION_CHANGES_MAP = {
  [Compare.Less]: DependencyChangeType.Changed,
  [Compare.More]: DependencyChangeType.Changed,
  [Compare.Equal]: DependencyChangeType.Unchanged,
};

export interface IPackageChange {
  name: string;
  type: DependencyChangeType;
  value?: string;
  link?: string;
  version?: SemVer;
  prevValue?: string;
  prevVersion?: SemVer;
}

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
    const { repository } = this.#data;

    if (!repository) TaskTree.fail('Package repository is empty');

    return typeof repository === 'object' ? repository.url : repository;
  }

  get version(): string {
    const semanticVersion = coerce(this.#data.version) ?? '';
    const validVersion = valid(semanticVersion);

    if (!semanticVersion) TaskTree.fail('Package version is empty or not SemVer (see https://semver.org/)');
    if (!validVersion) TaskTree.fail('Package version is not a valid SemVer (see https://semver.org/)');

    return validVersion;
  }

  get license(): string {
    return this.#data.license ?? '';
  }

  async bump(major: number, minor: number, patch: number): Promise<void> {
    const task = TaskTree.add('Updating package version');
    let version: string | null | undefined;

    if (major) version = inc(this.version, 'major');
    if (!major && minor) version = inc(this.version, 'minor');
    if (!major && !minor && patch) version = inc(this.version, 'patch');

    if (version) {
      this.#data.version = version;

      await writePkg({ ...(this.#data as { [key: string]: string }) });
      task.complete(`Package version updated to {bold ${version}}`);
    } else {
      task.fail('New package version is invalid or less (see https://semver.org/)');
    }
  }

  getChanges(property: Dependency | Restriction, prevValues: { [key: string]: string } | string[]): IPackageChange[] {
    return Array.isArray(prevValues)
      ? this.getRestrictionsChanges(property as Restriction, prevValues)
      : this.getDependenciesChanges(property as Dependency, prevValues);
  }

  private getDependenciesChanges(property: Dependency, dependencies: { [key: string]: string }): IPackageChange[] {
    const changes: IPackageChange[] = [];
    const currDeps = this.#data[property];
    const prevDeps = new Map(Object.entries(dependencies));

    if (currDeps) {
      const getLink = (type: Dependency, name: string, ver?: string): string | undefined => {
        const link = `https://www.npmjs.com/package/${name}/v/${ver}`;

        return type !== Dependency.Engines && ver ? link : undefined;
      };

      Object.entries(currDeps).forEach(([name, value]) => {
        const version = coerce(value);

        if (version) {
          const prevValue = prevDeps.get(name);
          const prevVersion = coerce(prevValue) ?? undefined;
          const link = getLink(property, name, version.version);
          let type = prevVersion ? VERSION_CHANGES_MAP[compare(version, prevVersion)] : DependencyChangeType.Added;

          if (type === DependencyChangeType.Unchanged && value !== prevValue) {
            type = DependencyChangeType.Changed;
          }

          changes.push({ name, value, type, version, link, prevValue, prevVersion });
          prevDeps.delete(name);
        }
      });

      prevDeps.forEach((prevValue, name) => {
        const prevVersion = coerce(prevValue) ?? undefined;
        const link = getLink(property, name, prevVersion?.version);

        changes.push({ name, type: DependencyChangeType.Removed, link, prevValue, prevVersion });
      });
    }

    return [...changes.values()].filter(change => change.type !== DependencyChangeType.Unchanged);
  }

  private getRestrictionsChanges(property: Restriction, prevRestrictions: string[]): IPackageChange[] {
    const changes: IPackageChange[] = [];
    const currRestrictions: string[] = this.#data[property] ?? [];
    const restrictions = [...prevRestrictions];
    const getName = (name: string): string => (name[0] === '!' ? name.slice(1) : name);

    changes.push(
      ...currRestrictions.map(value => {
        const index = restrictions.indexOf(value);
        const prevValue = restrictions[index];
        const type = prevValue
          ? RESTRICTION_CHANGES_MAP[value.localeCompare(prevValue) as Compare]
          : DependencyChangeType.Added;

        if (prevValue) restrictions.splice(index, 1);

        return { name: getName(value), value, type, prevValue };
      }),
      ...restrictions.map(prevValue => ({ name: getName(prevValue), type: DependencyChangeType.Removed, prevValue }))
    );

    return [...changes.values()].filter(change => change.type !== DependencyChangeType.Unchanged);
  }
}
