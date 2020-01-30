import semver, { SemVer } from 'semver';
import PackageRule, { PackageRuleChangeType, PackageRuleChange } from './PackageRule';
import { PackageDependencies, DependencyRuleType } from '../Package';

export default class DependencyRule extends PackageRule {
    public constructor(type: DependencyRuleType, deps?: PackageDependencies, prev?: PackageDependencies) {
        super(type);

        this.fillChanges(deps);
        this.compareWith(prev);
    }

    private getLink(name: string, version?: SemVer): string | undefined {
        let link: string | undefined;

        if (this.getType() !== DependencyRuleType.Engines && version) {
            link = `https://www.npmjs.com/package/${name}/v/${version.version}`;
        }

        return link;
    }

    private fillChanges(deps?: PackageDependencies): void {
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
    private compareWith(deps?: PackageDependencies): void {
        if (deps) {
            const { changes } = this;
            let change: PackageRuleChange | undefined;
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
                        switch (semver.compare(version, change.version)) {
                            case Compare.Less:
                                type = PackageRuleChangeType.Bumped;
                                break;
                            case Compare.More:
                                type = PackageRuleChangeType.Downgraded;
                                break;
                            default:
                                type = PackageRuleChangeType.Changed;
                                break;
                        }
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
