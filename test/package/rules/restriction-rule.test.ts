import { RestrictionRule, RestrictionRuleType } from '../../../src/package/rules/restriction-rule';
import { PackageRuleChangeType } from '../../../src/package/rules/package-rule';

describe('RestrictionRule', (): void => {
    it('Default', (): void => {
        const restriction = new RestrictionRule(
            RestrictionRuleType.CPU,
            ['x64', '!arm', '!mips'],
            ['x64', 'arm', 'ia32']
        );

        expect(restriction.getType()).toBe(RestrictionRuleType.CPU);

        expect(restriction.getChanges(PackageRuleChangeType.Unchanged)).toStrictEqual([
            {
                name: 'x64',
                type: PackageRuleChangeType.Unchanged,
                link: undefined,
                value: 'x64',
                version: undefined,
                prevValue: 'x64',
                prevVersion: undefined,
            },
        ]);

        expect(restriction.getChanges(PackageRuleChangeType.Changed)).toStrictEqual([
            {
                name: 'arm',
                type: PackageRuleChangeType.Changed,
                link: undefined,
                value: '!arm',
                version: undefined,
                prevValue: 'arm',
                prevVersion: undefined,
            },
        ]);

        expect(restriction.getChanges(PackageRuleChangeType.Added)).toStrictEqual([
            {
                name: 'mips',
                type: PackageRuleChangeType.Added,
                link: undefined,
                value: '!mips',
                version: undefined,
                prevValue: undefined,
                prevVersion: undefined,
            },
        ]);

        expect(restriction.getChanges(PackageRuleChangeType.Removed)).toStrictEqual([
            {
                name: 'ia32',
                type: PackageRuleChangeType.Removed,
                link: undefined,
                value: undefined,
                version: undefined,
                prevValue: 'ia32',
                prevVersion: undefined,
            },
        ]);
    });
});
