import { SemVer } from 'semver';
import { DependencyRuleType } from './dependency-rule';
import { RestrictionRuleType } from './restriction-rule';

export enum PackageRuleChangeType {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}

export type PackageRuleType = DependencyRuleType | RestrictionRuleType;

export interface PackageRuleChange {
    name: string;
    type: PackageRuleChangeType;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;
}

export class PackageRule {
    protected changes: Map<string, PackageRuleChange>;

    private type: PackageRuleType;

    public constructor(type: PackageRuleType) {
        this.type = type;
        this.changes = new Map();
    }

    public getType(): PackageRuleType {
        return this.type;
    }

    public getChanges(type: PackageRuleChangeType): PackageRuleChange[] {
        return [...this.changes.values()].filter((change): boolean => change.type === type);
    }
}
