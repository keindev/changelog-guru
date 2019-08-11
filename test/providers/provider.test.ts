import dotenv from 'dotenv';
import { GitHubProvider } from '../../src/providers/github/provider';
import { GitProvider } from '../../src/providers/git-provider';
import { ServiceProvider } from '../../src/config/config';

describe('Provider', (): void => {
    const $date = new Date(0).toISOString();
    let $provider: GitProvider;

    beforeAll((): void => {
        dotenv.config();
    });

    describe('GitHub', (): void => {
        beforeAll((): void => {
            $provider = new GitHubProvider('https://github.com/keindev/changelog-guru.git');
        });

        it('Default', (): void => {
            expect($provider.type).toBe(ServiceProvider.GitHub);
        });

        it('Get commits', (done): void => {
            $provider.getCommits($date, 1).then((commits): void => {
                expect(commits).toBeDefined();

                done();
            });
        }, 10000);

        it('Get commits count', (done): void => {
            $provider.getCommitsCount($date).then((count): void => {
                expect(count).toBeGreaterThanOrEqual(0);

                done();
            });
        }, 10000);

        it('Get last release', (done): void => {
            $provider.getLastRelease().then((releaseInfo): void => {
                expect(releaseInfo).toBeDefined();

                done();
            });
        }, 10000);

        it('Get previous package info', (done): void => {
            $provider.getPrevPackage().then((packageInfo): void => {
                expect(packageInfo).toBeDefined();

                done();
            });
        }, 10000);
    });
});
