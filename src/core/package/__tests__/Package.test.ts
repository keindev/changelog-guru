import * as semver from 'semver';
import Package from '../Package';

jest.mock('write-pkg', (): (() => Promise<void>) => (): Promise<void> => {
    return Promise.resolve();
});

const pkg = new Package();

describe('Package', () => {
    describe('Create new package', () => {
        it('Package version and repository read', () => {
            const version = semver.valid(pkg.getVersion());

            expect(version).not.toBeNull();
            expect(pkg.getRepository()).toBe('git+https://github.com/keindev/changelog-guru.git');
        });

        it('Bump package version', done => {
            const version = semver.valid(pkg.getVersion()) as string;

            pkg.incrementVersion(1, 0, 0).then(() => {
                expect(semver.major(pkg.getVersion())).toBeGreaterThan(semver.major(version));

                done();
            });
        });
    });
});
