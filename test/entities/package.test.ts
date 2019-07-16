import * as semver from 'semver';
import { Package } from '../../src/entities/package';

jest.mock('write-pkg', (): (() => Promise<void>) => (): Promise<void> => {
    return Promise.resolve();
});

describe('Package', (): void => {
    it('Create', (done): void => {
        const pkg = new Package();
        const version: string = semver.valid(pkg.getVersion()) || '';

        expect(pkg.getRepository()).toBe('git+https://github.com/keindev/changelog-guru.git');
        expect(version.length).toBeGreaterThanOrEqual(5);

        pkg.incrementVersion(1, 0, 0).then((): void => {
            expect(semver.major(pkg.getVersion())).toBeGreaterThan(semver.major(version));

            done();
        });
    });
});
