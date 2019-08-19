import semver from 'semver';
import { DependencyRule, DependencyRuleType } from '../../../src/package/rules/dependency-rule';
import { PackageRuleChangeType } from '../../../src/package/rules/package-rule';

describe('DependencyRule', (): void => {
    it('Default', (): void => {
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

        expect(dependency.getType()).toBe(DependencyRuleType.Dependencies);
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

    it('Empty current version dependencies', (): void => {
        const dependency = new DependencyRule(DependencyRuleType.Dependencies, undefined, { package1: '^1.0.0' });

        expect(dependency.getType()).toBe(DependencyRuleType.Dependencies);
        expect(dependency.getChanges(PackageRuleChangeType.Removed)).toStrictEqual([
            {
                name: 'package1',
                type: PackageRuleChangeType.Removed,
                link: 'https://www.npmjs.com/package/package1/v/1.0.0',
                value: undefined,
                version: undefined,
                prevValue: '^1.0.0',
                prevVersion: semver.coerce('^1.0.0'),
            },
        ]);
    });

    it('Empty previous dependencies', (): void => {
        const dependency = new DependencyRule(DependencyRuleType.Dependencies, { package1: '^1.0.0' });

        expect(dependency.getType()).toBe(DependencyRuleType.Dependencies);
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
});
