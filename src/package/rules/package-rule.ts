import { PackageRuleType } from '../typings/types';
import { PackageRuleChangeType } from './typings/enums';
import { PackageRuleChange } from './typings/types';

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
