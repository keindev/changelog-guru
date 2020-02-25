import semver, { SemVer } from 'semver';
import Rule, { IRule, Change, Dependency } from './Rule';
import { Compare } from '../../entities/Entity';

const types = {
    [Compare.Less]: Change.Bumped,
    [Compare.More]: Change.Downgraded,
    [Compare.Equal]: Change.Unchanged,
};

export default class DependencyRule extends Rule {
    constructor(type: Dependency, deps?: IPackageDependencies, prev?: IPackageDependencies) {
        super(type);

        this.fillChanges(deps);
        this.compareWith(prev);
    }

    private link(name: string, ver?: string): string | undefined {
        return this.type !== Dependency.Engines && ver ? `https://www.npmjs.com/package/${name}/v/${ver}` : undefined;
    }

    // eslint-disable-next-line class-methods-use-this
    private compare2(left: Map<string, string>, right: Map<string, string>): void {
        const changes = new Map<string, Change>();

        left.forEach((value, name) => {
            const version = semver.coerce(value);

            const prevValue = right.get(name);
            const prevVersion = semver.coerce(prevValue);
            const type = prevVersion ? types[semver.compare(version, prevVersion)] : Change.Added;
            const link = this.link(name, version?.version);

            changes.set(name, new Change({ name, value, type, version, link, prevValue, prevVersion }));
            right.delete(name);
        });

        right.forEach((prevValue, name) => {
            const prevVersion = semver.coerce(prevValue);
            const link = this.link(name, prevVersion?.version);

            changes.set(name, new Change({ name, type: Change.Removed, link, prevValue, prevVersion }));
        });
    }

    /*
        Object.entries(left).forEach(([name, value]) => {
            const version = semver.coerce(value);

            //-----------------------------------------
            let change: IRule | undefined;
            let version2: SemVer | undefined;
            let type: Change;

            Object.entries(right).forEach(([name, value]) => {
                version = semver.coerce(value) || undefined;
                change = changes.get(name);

                if (change) {
                    type = value.localeCompare(change.value as string) ? Change.Changed : Change.Unchanged;

                    if (type === Change.Changed && version && change.version) {
                        type = {
                            [Compare.Less]: Change.Bumped,
                            [Compare.More]: Change.Downgraded,
                            [Compare.Equal]: Change.Changed,
                        }[semver.compare(version, change.version)];
                    }

                    change.type = type;
                    change.prevValue = value;
                    change.prevVersion = version;
                } else {
                    changes.set(name, {
                        name,
                        value: undefined,
                        version: undefined,
                        type: Change.Removed,
                        link: this.getLink(name, version),
                        prevValue: value,
                        prevVersion: version,
                    });
                }
            });
            //-----------------------------------------

            this.changes.set(name, {
                name,
                value,
                version,
                type: Change.Added,
                link: this.getLink(name, version),
                prevValue: undefined,
                prevVersion: undefined,
            });
        });
        */
    private fillChanges(deps?: IPackageDependencies): void {
        if (deps) {
            let version: SemVer | undefined;

            Object.entries(deps).forEach(([name, value]) => {
                version = semver.coerce(value) || undefined;

                this.changes.set(name, {
                    name,
                    value,
                    version,
                    type: Change.Added,
                    link: this.getLink(name, version),
                    prevValue: undefined,
                    prevVersion: undefined,
                });
            });
        }
    }

    // FIXME: make func shorter
    // eslint-disable-next-line max-lines-per-function
    private compareWith(deps?: IPackageDependencies): void {
        if (deps) {
            const { changes } = this;
            let change: IRule | undefined;
            let version: SemVer | undefined;
            let type: Change;

            Object.entries(deps).forEach(([name, value]) => {
                version = semver.coerce(value) || undefined;
                change = changes.get(name);

                if (change) {
                    type = value.localeCompare(change.value as string) ? Change.Changed : Change.Unchanged;

                    if (type === Change.Changed && version && change.version) {
                        type = {
                            [Compare.Less]: Change.Bumped,
                            [Compare.More]: Change.Downgraded,
                            [Compare.Equal]: Change.Changed,
                        }[semver.compare(version, change.version)];
                    }

                    change.type = type;
                    change.prevValue = value;
                    change.prevVersion = version;
                } else {
                    changes.set(name, {
                        name,
                        value: undefined,
                        version: undefined,
                        type: Change.Removed,
                        link: this.getLink(name, version),
                        prevValue: value,
                        prevVersion: version,
                    });
                }
            });
        }
    }
}
