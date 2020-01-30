import { SemVer } from 'semver';
import { DependencyRuleType } from './DependencyRule';
import { RestrictionRuleType } from './RestrictionRule';

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
    protected changes: Map<string, IPackageRuleChange>;

    private type: PackageRuleType;

    public constructor(type: PackageRuleType) {
        this.type = type;
        this.changes = new Map();
    }

    public getType(): PackageRuleType {
        return this.type;
    }

    public getChanges(type: PackageRuleChangeType): IPackageRuleChange[] {
        return [...this.changes.values()].filter(change => change.type === type);
    }
}
