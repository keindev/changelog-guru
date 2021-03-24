import readPkg from 'read-pkg';
import * as semver from 'semver';

import Package, { Dependency, DependencyChangeType, Restriction } from '../core/Package';

jest.mock('write-pkg', (): (() => Promise<void>) => (): Promise<void> => Promise.resolve());

describe('Package', () => {
  const pkg = new Package();
  const data = readPkg.sync({ normalize: false });

  describe('Create new package', () => {
    it('Package version and repository read', () => {
      const version = semver.valid(pkg.version);

      expect(version).not.toBeNull();
      expect(pkg.repository).toBe('git+https://github.com/keindev/changelog-guru.git');
    });

    it('Bump package version', async () => {
      const version = semver.valid(pkg.version) as string;

      await pkg.bump(1, 0, 0);

      expect(semver.major(pkg.version)).toBeGreaterThan(semver.major(version));
    });
  });

  describe('Dependencies', () => {
    it('Get list of added packages', () => {
      let dependencies = data[Dependency.Dependencies] ?? {};
      let changes = pkg.getDependenciesChanges(Dependency.Dependencies, new Map(Object.entries(dependencies)));

      expect(changes).toStrictEqual([]);

      dependencies = { ...dependencies, test: '^1.0.0' };
      changes = pkg.getDependenciesChanges(Dependency.Dependencies, new Map(Object.entries(dependencies)));

      expect(changes).toStrictEqual([
        {
          name: 'test',
          type: DependencyChangeType.Added,
          link: 'https://www.npmjs.com/package/test/v/1.0.0',
          value: '^1.0.0',
          version: semver.coerce('^1.0.0'),
          prevValue: undefined,
          prevVersion: undefined,
        },
      ]);
    });
  });

  describe('RestrictionRule', () => {
    it('Get list of added restrictions', () => {
      let restrictions = data[Restriction.OS] ?? [];
      let changes = pkg.getRestrictionsChanges(Restriction.OS, restrictions);

      expect(changes).toStrictEqual([]);

      restrictions = [...restrictions, 'linux'];
      changes = pkg.getRestrictionsChanges(Restriction.OS, restrictions);

      expect(changes).toStrictEqual([{ name: 'linux', type: DependencyChangeType.Added, value: 'linux' }]);
    });
  });
});
