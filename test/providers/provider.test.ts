import dotenv from 'dotenv';
import { ServiceProvider } from '../../src/config/typings/enums';
import { GitHubProvider } from '../../src/providers/github/provider';
import { GitProvider } from '../../src/providers/git-provider';

describe('Provider', (): void => {
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
            $provider.getCommits(1).then((commits): void => {
                expect(commits).toBeDefined();

                done();
            });
        });

        it('Get last release', (done): void => {
            $provider.getLastRelease().then((releaseInfo): void => {
                expect(releaseInfo).toBeDefined();

                done();
            });
        });

        it('Get previous package info', (done): void => {
            $provider.getPrevPackage().then((packageInfo): void => {
                expect(packageInfo).toBeDefined();

                done();
            });
        });
    });
});
