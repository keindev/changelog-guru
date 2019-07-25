import semver, { SemVer } from 'semver';
import { Modification, Compare } from '../../utils/enums';

export enum PackageDependencyType {
    // https://docs.npmjs.com/files/package.json#engines
    Engines = 1,
    // https://docs.npmjs.com/files/package.json#dependencies
    Dependencies = 2,
    // https://docs.npmjs.com/files/package.json#devdependencies
    DevDependencies = 3,
    // https://docs.npmjs.com/files/package.json#peerdependencies
    Peerdependencies = 4,
    // https://docs.npmjs.com/files/package.json#optionaldependencies
    Optionaldependencies = 5,
}

export interface PackageDependency {
    [x: string]: string;
}

export interface DependencyModification {
    name: string;
    type: Modification;
    value?: string;
    prevValue?: string;
    version?: SemVer | null;
    prevVersion?: SemVer | null;
}

export class Dependency {
    private modifications: Map<string, DependencyModification> = new Map();

    public constructor(deps?: PackageDependency, prev?: PackageDependency) {
        if (deps) {
            if (prev) {
                Object.entries(deps).forEach((tuple: [string, string]): void => {
                    const [name, value] = tuple;
                    const prevValue = prev[name];

                    if (prevValue) {
                        if (!value.localeCompare(prevValue)) {
                            this.setChangedModify(tuple, prevValue);
                        } else {
                            this.setUnchangedModify(tuple);
                        }
                    } else {
                        this.setAddedModify(tuple);
                    }
                });
            } else {
                Object.entries(deps).forEach(this.setAddedModify, this);
            }
        } else if (prev) {
            Object.entries(prev).forEach(this.setRemovedModify, this);
        }
    }

    public static compare(a: DependencyModification, b: DependencyModification): number {
        return a.type - b.type;
    }

    public getModifications(): DependencyModification[] {
        return [...this.modifications.values()].sort(Dependency.compare);
    }

    private setAddedModify([name, value]: [string, string]): void {
        this.modifications.set(name, {
            name,
            value,
            type: Modification.Added,
            version: semver.coerce(value),
        });
    }

    private setRemovedModify([name, value]: [string, string]): void {
        this.modifications.set(name, {
            name,
            type: Modification.Removed,
            prevValue: value,
            prevVersion: semver.coerce(value),
        });
    }

    private setChangedModify([name, value]: [string, string], prevValue: string): void {
        const version = semver.coerce(value);
        const prevVersion = semver.coerce(prevValue);
        let type = Modification.Changed;

        if (version && prevVersion) {
            switch (semver.compare(version, prevVersion)) {
                case Compare.More:
                    type = Modification.Bumped;
                    break;
                case Compare.Less:
                    type = Modification.Downgraded;
                    break;
                default:
                    type = Modification.Unchanged;
                    break;
            }
        }

        this.modifications.set(name, {
            name,
            type,
            value,
            prevValue,
            version,
            prevVersion,
        });
    }

    private setUnchangedModify([name, value]: [string, string]): void {
        this.modifications.set(name, {
            name,
            value,
            type: Modification.Unchanged,
            version: semver.coerce(value),
        });
    }
}
