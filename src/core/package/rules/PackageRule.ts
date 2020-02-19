import { SemVer } from 'semver';
import { DependencyRuleType, RestrictionRuleType } from '../Package';

export enum PackageRuleChangeType {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}

export type PackageRuleType = DependencyRuleType | RestrictionRuleType;

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

    getChanges(type: PackageRuleChangeType | string): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type);
    }
}
