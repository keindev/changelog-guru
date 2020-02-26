import semver from 'semver';
import DependencyRule from '../DependencyRule';
import { PackageRuleChangeType } from '../PackageRule';
import { DependencyRuleType } from '../../Package';

const dependency = new DependencyRule(
    DependencyRuleType.Dependencies,
    {
        package1: '^1.0.0',
        package2: '^2.0.0',
        package3: 'path/to/file',
        package4: '3.9.0',
        package6: '2.0.0',
    },
    {
        package2: '^1.9.1',
        package3: 'path/to/another/file',
        package4: '^4.0.0',
        package5: '^1.0.0',
        package6: '2.0.0',
    }
);

describe('DependencyRule', () => {
    describe('Get changes', () => {
        it('Get list of added packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Added)).toStrictEqual([
                {
                    name: 'package1',
                    type: PackageRuleChangeType.Added,
                    link: 'https://www.npmjs.com/package/package1/v/1.0.0',
                    value: '^1.0.0',
                    version: semver.coerce('^1.0.0'),
                    prevValue: undefined,
                    prevVersion: undefined,
                },
            ]);
        });

        it('Get list of bumped packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Bumped)).toStrictEqual([
                {
                    name: 'package2',
                    type: PackageRuleChangeType.Bumped,
                    link: 'https://www.npmjs.com/package/package2/v/2.0.0',
                    value: '^2.0.0',
                    version: semver.coerce('^2.0.0'),
                    prevValue: '^1.9.1',
                    prevVersion: semver.coerce('^1.9.1'),
                },
            ]);
        });

        it('Get list of changed packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Changed)).toStrictEqual([
                {
                    name: 'package3',
                    type: PackageRuleChangeType.Changed,
                    link: undefined,
                    value: 'path/to/file',
                    version: undefined,
                    prevValue: 'path/to/another/file',
                    prevVersion: undefined,
                },
            ]);
        });

        it('Get list of downgraded packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Downgraded)).toStrictEqual([
                {
                    name: 'package4',
                    type: PackageRuleChangeType.Downgraded,
                    link: 'https://www.npmjs.com/package/package4/v/3.9.0',
                    value: '3.9.0',
                    version: semver.coerce('3.9.0'),
                    prevValue: '^4.0.0',
                    prevVersion: semver.coerce('^4.0.0'),
                },
            ]);
        });

        it('Get list of removed packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Removed)).toStrictEqual([
                {
                    name: 'package5',
                    type: PackageRuleChangeType.Removed,
                    link: 'https://www.npmjs.com/package/package5/v/1.0.0',
                    value: undefined,
                    version: undefined,
                    prevValue: '^1.0.0',
                    prevVersion: semver.coerce('^1.0.0'),
                },
            ]);
        });

        it('Get list of unchanged packages', () => {
            expect(dependency.getChanges(PackageRuleChangeType.Unchanged)).toStrictEqual([
                {
                    name: 'package6',
                    type: PackageRuleChangeType.Unchanged,
                    link: 'https://www.npmjs.com/package/package6/v/2.0.0',
                    value: '2.0.0',
                    version: semver.coerce('2.0.0'),
                    prevValue: '2.0.0',
                    prevVersion: semver.coerce('2.0.0'),
                },
            ]);
        });
    });
});
