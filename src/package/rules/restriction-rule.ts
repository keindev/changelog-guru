import { PackageRule, PackageRuleChange, PackageRuleChangeType } from './package-rule';

export enum RestrictionRuleType {
    // https://docs.npmjs.com/files/package.json#bundleddependencies
    BundledDependencies = 'bundledDependencies',
    // https://docs.npmjs.com/files/package.json#os
    OS = 'os',
    // https://docs.npmjs.com/files/package.json#cpu
    CPU = 'cpu',
}

export class RestrictionRule extends PackageRule {
    public static BLACKLIST_MARK = '!';

    public constructor(type: RestrictionRuleType, restrictions?: string[], prev?: string[]) {
        super(type);

        this.fillChanges(restrictions);
        this.compareWith(prev);
    }

    private static getClearName(value: string): string {
        return value[0] === RestrictionRule.BLACKLIST_MARK ? value.substring(1, value.length) : value;
    }

    private fillChanges(restrictions?: string[]): void {
        if (Array.isArray(restrictions)) {
            let name: string;

            restrictions.forEach((value): void => {
                name = RestrictionRule.getClearName(value);

                this.changes.set(name, {
                    name,
                    value,
                    type: PackageRuleChangeType.Added,
                    version: undefined,
                    link: undefined,
                    prevValue: undefined,
                    prevVersion: undefined,
                });
            });
        }
    }

    private compareWith(restrictions?: string[]): void {
        if (Array.isArray(restrictions)) {
            const { changes } = this;
            let change: PackageRuleChange | undefined;
            let name: string;

            restrictions.forEach((value): void => {
                name = RestrictionRule.getClearName(value);
                change = changes.get(name);

                if (change) {
                    change.prevValue = value;
                    change.type = value.localeCompare(change.value as string)
                        ? PackageRuleChangeType.Changed
                        : PackageRuleChangeType.Unchanged;
                } else {
                    changes.set(name, {
                        name,
                        value: undefined,
                        version: undefined,
                        type: PackageRuleChangeType.Removed,
                        link: undefined,
                        prevValue: value,
                        prevVersion: undefined,
                    });
                }
            });
        }
    }
}
