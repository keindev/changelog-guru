import faker from 'faker';
import fs from 'fs';
import * as semver from 'semver';

import Package, { Dependency, DependencyChangeType, Restriction } from '../core/Package';

jest.mock('fs');
jest.mock('write-pkg', (): (() => Promise<void>) => (): Promise<void> => Promise.resolve());

const data = {
  name: 'changelog-guru',
  version: faker.system.semver(),
  description: 'Git changelog generator',
  homepage: 'https://github.com/keindev/changelog-guru#readme',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'git+https://github.com/keindev/changelog-guru.git',
  },
  dependencies: {
    'gh-gql': '^1.0.0',
    'string-lookup-manager': `^${faker.system.semver()}`,
    'tasktree-cli': `^${faker.system.semver()}`,
  },
  os: ['linux'],
};

describe('Package', () => {
  jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(data));

  const pkg = new Package();

  it('Version and repository read', () => {
    const version = semver.valid(pkg.version);

    expect(version).not.toBeNull();
    expect(pkg.repository).toBe('git+https://github.com/keindev/changelog-guru.git');
  });

  it('Bump package version', async () => {
    const version = semver.valid(pkg.version) as string;

    await pkg.bump({ major: 1, minor: 1, patch: 99, branch: 'dev', version: pkg.version });

    expect(semver.major(pkg.version)).toBeGreaterThan(semver.major(version));
    expect(semver.minor(pkg.version)).toBe(0);
    expect(semver.patch(pkg.version)).toBe(0);
  });

  it('Get list of removed dependencies', () => {
    const dependencies = data[Dependency.Dependencies] ?? {};

    expect(pkg.getChanges(Dependency.Dependencies, dependencies)).toStrictEqual([]);
    expect(
      pkg.getChanges(Dependency.Dependencies, { ...dependencies, test: '^1.0.0', 'gh-gql': '>=1.0.0' })
    ).toStrictEqual([
      {
        link: 'https://www.npmjs.com/package/gh-gql/v/1.0.0',
        name: 'gh-gql',
        prevValue: '>=1.0.0',
        prevVersion: semver.coerce('1.0.0'),
        type: DependencyChangeType.Changed,
        value: '^1.0.0',
        version: semver.coerce('1.0.0'),
      },
      {
        name: 'test',
        type: DependencyChangeType.Removed,
        link: 'https://www.npmjs.com/package/test/v/1.0.0',
        prevValue: '^1.0.0',
        prevVersion: semver.coerce('^1.0.0'),
      },
    ]);
  });

  it('Get list of added restrictions', () => {
    expect(pkg.getChanges(Restriction.OS, [])).toStrictEqual([
      {
        name: 'linux',
        prevValue: undefined,
        type: 'added',
        value: 'linux',
      },
    ]);
    expect(pkg.getChanges(Restriction.OS, ['linux', '!win32'])).toStrictEqual([
      {
        name: 'win32',
        type: 'removed',
        prevValue: '!win32',
      },
    ]);
  });
});
