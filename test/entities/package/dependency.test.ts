import semver from 'semver';
import { Dependency, DependencyType } from '../../../src/entities/package/dependency';
import { Modification } from '../../../src/utils/enums';

describe('License', (): void => {
    it('Default', (): void => {
        const dependency = new Dependency(
            DependencyType.Dependencies,
            {
                package1: '^1.0.0',
                package2: '^2.0.0',
                package3: 'file/path/name1',
                package4: '3.9.0',
                package6: '2.0.0',
            },
            {
                package2: '^1.9.1',
                package3: 'file/path/name2',
                package4: '^4.0.0',
                package5: '^1.0.0',
                package6: '2.0.0',
            }
        );

        expect(dependency.type).toBe(DependencyType.Dependencies);
        expect(dependency.getModifications(Modification.Added)).toStrictEqual([
            {
                name: 'package1',
                type: Modification.Added,
                value: '^1.0.0',
                version: semver.coerce('^1.0.0'),
            },
        ]);

        expect(dependency.getModifications(Modification.Bumped)).toStrictEqual([
            {
                name: 'package2',
                type: Modification.Bumped,
                value: '^2.0.0',
                version: semver.coerce('^2.0.0'),
                prevValue: '^1.9.1',
                prevVersion: semver.coerce('^1.9.1'),
            },
        ]);

        expect(dependency.getModifications(Modification.Changed)).toStrictEqual([
            {
                name: 'package3',
                type: Modification.Changed,
                value: 'file/path/name1',
                version: undefined,
                prevValue: 'file/path/name2',
                prevVersion: undefined,
            },
        ]);

        expect(dependency.getModifications(Modification.Downgraded)).toStrictEqual([
            {
                name: 'package4',
                type: Modification.Downgraded,
                value: '3.9.0',
                version: semver.coerce('3.9.0'),
                prevValue: '^4.0.0',
                prevVersion: semver.coerce('^4.0.0'),
            },
        ]);

        expect(dependency.getModifications(Modification.Removed)).toStrictEqual([
            {
                name: 'package5',
                type: Modification.Removed,
                prevValue: '^1.0.0',
                prevVersion: semver.coerce('^1.0.0'),
            },
        ]);

        expect(dependency.getModifications(Modification.Unchanged)).toStrictEqual([
            {
                name: 'package6',
                type: Modification.Unchanged,
                value: '2.0.0',
                version: semver.coerce('2.0.0'),
            },
        ]);
    });

    it('Empty current version dependencies', (): void => {
        const dependency = new Dependency(DependencyType.Dependencies, undefined, { package1: '^1.0.0' });

        expect(dependency.type).toBe(DependencyType.Dependencies);
        expect(dependency.getModifications(Modification.Removed)).toStrictEqual([
            {
                name: 'package1',
                type: Modification.Removed,
                prevValue: '^1.0.0',
                prevVersion: semver.coerce('^1.0.0'),
            },
        ]);
    });

    it('Empty previous dependencies', (): void => {
        const dependency = new Dependency(DependencyType.Dependencies, { package1: '^1.0.0' });

        expect(dependency.type).toBe(DependencyType.Dependencies);
        expect(dependency.getModifications(Modification.Added)).toStrictEqual([
            {
                name: 'package1',
                type: Modification.Added,
                value: '^1.0.0',
                version: semver.coerce('^1.0.0'),
            },
        ]);
    });
});
