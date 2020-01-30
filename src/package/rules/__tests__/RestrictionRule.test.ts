import RestrictionRule, { RestrictionRuleType } from '../RestrictionRule';
import { PackageRuleChangeType } from '../PackageRule';

const restriction = new RestrictionRule(RestrictionRuleType.CPU, ['x64', '!arm', '!mips'], ['x64', 'arm', 'ia32']);

describe('RestrictionRule', () => {
    describe('Get changes', () => {
        it('Get list of unchanged restrictions', () => {
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
        });

        it('Get list of changed restrictions', () => {
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
        });

        it('Get list of added restrictions', () => {
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
        });

        it('Get list of removed restrictions', () => {
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
});
