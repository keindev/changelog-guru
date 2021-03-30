import fs from 'fs';
import path from 'path';
import * as semver from 'semver';
import { PackageJson } from 'type-fest';

import Package, { Dependency, DependencyChangeType, Restriction } from '../core/Package';

jest.mock('write-pkg', (): (() => Promise<void>) => (): Promise<void> => Promise.resolve());

describe('Package', () => {
  const pkg = new Package();

  describe('Package', () => {
    it('Version and repository read', () => {
      const version = semver.valid(pkg.version);

      expect(version).not.toBeNull();
      expect(pkg.repository).toBe('git+https://github.com/keindev/changelog-guru.git');
    });

    it('Bump package version', async () => {
      const version = semver.valid(pkg.version) as string;

      await pkg.bump({ major: 1, minor: 1, patch: 99, branch: 'dev' });

      expect(semver.major(pkg.version)).toBeGreaterThan(semver.major(version));
      expect(semver.minor(pkg.version)).toBe(0);
      expect(semver.patch(pkg.version)).toBe(0);
    });
  });

  describe('Dependencies', () => {
    it('Get list of removed packages', () => {
      const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')) as PackageJson;
      const dependencies = data[Dependency.Dependencies] ?? {};

      expect(pkg.getChanges(Dependency.Dependencies, dependencies)).toStrictEqual([]);
      expect(pkg.getChanges(Dependency.Dependencies, { ...dependencies, test: '^1.0.0' })).toStrictEqual([
        {
          name: 'test',
          type: DependencyChangeType.Removed,
          link: 'https://www.npmjs.com/package/test/v/1.0.0',
          prevValue: '^1.0.0',
          prevVersion: semver.coerce('^1.0.0'),
        },
      ]);
    });
  });

  describe('Restrictions', () => {
    it('Get list of added restrictions', () => {
      expect(pkg.getChanges(Restriction.OS, [])).toStrictEqual([]);
      expect(pkg.getChanges(Restriction.OS, ['linux', '!win32'])).toStrictEqual([
        { name: 'linux', type: 'removed', prevValue: 'linux' },
        { name: 'win32', type: 'removed', prevValue: '!win32' },
      ]);
    });
  });
});
