import { SemVer } from 'semver';

export enum PackageRuleChangeType {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}

export interface IPackageRuleChange {
    name: string;
    type: PackageRuleChangeType;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;
}

export default class PackageRule {
    readonly type: PackageRuleType;

    protected changes = new Map<string, IPackageRuleChange>();

    constructor(type: PackageRuleType) {
        this.type = type;
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === PackageRuleChangeType.Added)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get added(): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type)
    }

    get
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}
