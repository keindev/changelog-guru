import semver from 'semver';
import { Dependency } from '../../src/package/dependency';
import { DependencyType, DependencyModification } from '../../src/package/typings/enums';

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
        expect(dependency.getModifications(DependencyModification.Added)).toStrictEqual([
            {
                name: 'package1',
                type: DependencyModification.Added,
                value: '^1.0.0',
                version: semver.coerce('^1.0.0'),
            },
        ]);

        expect(dependency.getModifications(DependencyModification.Bumped)).toStrictEqual([
            {
                name: 'package2',
                type: DependencyModification.Bumped,
                value: '^2.0.0',
                version: semver.coerce('^2.0.0'),
                prevValue: '^1.9.1',
                prevVersion: semver.coerce('^1.9.1'),
            },
        ]);

        expect(dependency.getModifications(DependencyModification.Changed)).toStrictEqual([
            {
                name: 'package3',
                type: DependencyModification.Changed,
                value: 'file/path/name1',
                version: undefined,
                prevValue: 'file/path/name2',
                prevVersion: undefined,
            },
        ]);

        expect(dependency.getModifications(DependencyModification.Downgraded)).toStrictEqual([
            {
                name: 'package4',
                type: DependencyModification.Downgraded,
                value: '3.9.0',
                version: semver.coerce('3.9.0'),
                prevValue: '^4.0.0',
                prevVersion: semver.coerce('^4.0.0'),
            },
        ]);

        expect(dependency.getModifications(DependencyModification.Removed)).toStrictEqual([
            {
                name: 'package5',
                type: DependencyModification.Removed,
                prevValue: '^1.0.0',
                prevVersion: semver.coerce('^1.0.0'),
            },
        ]);

        expect(dependency.getModifications(DependencyModification.Unchanged)).toStrictEqual([
            {
                name: 'package6',
                type: DependencyModification.Unchanged,
                value: '2.0.0',
                version: semver.coerce('2.0.0'),
            },
        ]);
    });

    it('Get npm package links', (): void => {
        const dependency = new Dependency(
            DependencyType.Dependencies,
            {
                'changelog-guru': '0.9.1',
                '@types/jest': '^23.3.13',
            },
            {
                'changelog-guru': '0.9.0',
                '@types/jest': '^24.0.15',
                '@types/node': '^12.6.8',
            }
        );

        expect(dependency.getLink('changelog-guru')).toBe('https://www.npmjs.com/package/changelog-guru/v/0.9.1');
        expect(dependency.getLink('@types/jest')).toBe('https://www.npmjs.com/package/@types/jest/v/23.3.13');
        expect(dependency.getLink('@types/node')).toBe('https://www.npmjs.com/package/@types/node/v/12.6.8');
    });

    it('Empty current version dependencies', (): void => {
        const dependency = new Dependency(DependencyType.Dependencies, undefined, { package1: '^1.0.0' });

        expect(dependency.type).toBe(DependencyType.Dependencies);
        expect(dependency.getModifications(DependencyModification.Removed)).toStrictEqual([
            {
                name: 'package1',
                type: DependencyModification.Removed,
                prevValue: '^1.0.0',
                prevVersion: semver.coerce('^1.0.0'),
            },
        ]);
    });

    it('Empty previous dependencies', (): void => {
        const dependency = new Dependency(DependencyType.Dependencies, { package1: '^1.0.0' });

        expect(dependency.type).toBe(DependencyType.Dependencies);
        expect(dependency.getModifications(DependencyModification.Added)).toStrictEqual([
            {
                name: 'package1',
                type: DependencyModification.Added,
                value: '^1.0.0',
                version: semver.coerce('^1.0.0'),
            },
        ]);
    });
});
