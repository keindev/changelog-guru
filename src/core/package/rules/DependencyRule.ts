import semver, { SemVer } from 'semver';
import PackageRule, { PackageRuleChangeType, IPackageRuleChange } from './PackageRule';
import { DependencyRuleType, IPackageDependencies } from '../Package';
import { Compare } from '../../entities/Entity';

const types = {
    [Compare.Less]: PackageRuleChangeType.Bumped,
    [Compare.More]: PackageRuleChangeType.Downgraded,
    [Compare.Equal]: PackageRuleChangeType.Changed,
};

export default class DependencyRule extends PackageRule {
    constructor(type: DependencyRuleType, deps?: IPackageDependencies, prev?: IPackageDependencies) {
        super(type);

        this.fillChanges(deps);
        this.compareWith(prev);
    }

    private getLink(name: string, version?: SemVer): string | undefined {
        let link: string | undefined;

        if (this.type !== DependencyRuleType.Engines && version) {
            link = `https://www.npmjs.com/package/${name}/v/${version.version}`;
        }

        return link;
    }

    private fillChanges(deps?: IPackageDependencies): void {
        if (deps) {
            let version: SemVer | undefined;

            Object.entries(deps).forEach(([name, value]) => {
                version = semver.coerce(value) || undefined;

                this.changes.set(name, {
                    name,
                    value,
                    version,
                    type: PackageRuleChangeType.Added,
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
            let change: IPackageRuleChange | undefined;
            let version: SemVer | undefined;
            let type: PackageRuleChangeType;

            Object.entries(deps).forEach(([name, value]) => {
                version = semver.coerce(value) || undefined;
                change = changes.get(name);

                if (change) {
                    type = value.localeCompare(change.value as string)
                        ? PackageRuleChangeType.Changed
                        : PackageRuleChangeType.Unchanged;

                    if (type === PackageRuleChangeType.Changed && version && change.version) {
                        type = types[semver.compare(version, change.version)];
                    }

                    change.type = type;
                    change.prevValue = value;
                    change.prevVersion = version;
                } else {
                    changes.set(name, {
                        name,
                        value: undefined,
                        version: undefined,
                        type: PackageRuleChangeType.Removed,
                        link: this.getLink(name, version),
                        prevValue: value,
                        prevVersion: version,
                    });
                }
            });
        }
    }
}
