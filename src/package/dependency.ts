import semver, { SemVer } from 'semver';
import { DependencyType, DependencyModification } from './typings/enums';
import { PackageDependency, DependencyInfo } from './typings/types';
import { Compare } from '../typings/enums';

export class Dependency {
    public readonly type: DependencyType;

    private modifications: Map<string, DependencyInfo> = new Map();

    public constructor(type: DependencyType, deps?: PackageDependency, prev?: PackageDependency) {
        this.type = type;

        if (deps) {
            if (prev) {
                Object.entries(deps).forEach((tuple: [string, string]): void => {
                    const [name, value] = tuple;
                    const prevValue = prev[name];

                    if (prevValue) {
                        if (!value.localeCompare(prevValue)) {
                            this.setUnchangedModify(tuple);
                        } else {
                            this.setChangedModify(tuple, prevValue);
                        }
                    } else {
                        this.setAddedModify(tuple);
                    }
                });

                Object.entries(prev).forEach((tuple: [string, string]): void => {
                    const [name] = tuple;

                    if (!deps[name]) this.setRemovedModify(tuple);
                });
            } else {
                Object.entries(deps).forEach(this.setAddedModify, this);
            }
        } else if (prev) {
            Object.entries(prev).forEach(this.setRemovedModify, this);
        }
    }

    public getModifications(type: DependencyModification): DependencyInfo[] {
        return [...this.modifications.values()].filter((modification): boolean => modification.type === type);
    }

    public getLink(name: string): string | undefined {
        let link: string | undefined;

        if (this.type !== DependencyType.Engines) {
            const modification = this.modifications.get(name);

            if (modification && modification.type !== DependencyModification.Changed) {
                const version = modification.version || modification.prevVersion;

                if (version) {
                    link = `https://www.npmjs.com/package/${name}/v/${version.version}`;
                }
            }
        }

        return link;
    }

    private setAddedModify([name, value]: [string, string]): void {
        this.modifications.set(name, {
            name,
            value,
            type: DependencyModification.Added,
            version: semver.coerce(value) || undefined,
        });
    }

    private setRemovedModify([name, value]: [string, string]): void {
        this.modifications.set(name, {
            name,
            type: DependencyModification.Removed,
            prevValue: value,
            prevVersion: semver.coerce(value) || undefined,
        });
    }

    private setChangedModify([name, value]: [string, string], prevValue: string): void {
        const isNotPath = (v: string): boolean => !(v.includes('\\') || v.includes('/'));
        let version: SemVer | undefined;
        let prevVersion: SemVer | undefined;
        let type = DependencyModification.Changed;

        if (isNotPath(value) && isNotPath(prevValue)) {
            version = semver.coerce(value) || undefined;
            prevVersion = semver.coerce(prevValue) || undefined;

            if (version && prevVersion && !value.includes('\\') && !value.includes('/')) {
                switch (semver.compare(version, prevVersion)) {
                    case Compare.More:
                        type = DependencyModification.Bumped;
                        break;
                    case Compare.Less:
                        type = DependencyModification.Downgraded;
                        break;
                    default:
                        type = DependencyModification.Unchanged;
                        break;
                }
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
            type: DependencyModification.Unchanged,
            version: semver.coerce(value) || undefined,
        });
    }
}
