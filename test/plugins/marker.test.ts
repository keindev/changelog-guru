import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state.mock';
import { Configuration } from '../../src/entities/configuration';
import { Commit } from '../../src/entities/commit';
import { Status } from '../../src/utils/enums';
import MarkerPlugin, { Configuration as MarkerConfiguration } from '../../src/plugins/marker';

describe('MarkerPlugin', (): void => {
    const config = new Configuration();
    const context = new MockState();
    const plugin = new MarkerPlugin(context);
    const task = new Task('test task');

    it('Default', (done): void => {
        config.load(task).then((): void => {
            plugin.init(config.getOptions() as MarkerConfiguration).then((): void => {
                expect(context.getSections().length).toBe(3);
                expect(context.findSection('Important Internal Changes')).toBeDefined();
                expect(context.findSection('DEPRECATIONS')).toBeDefined();
                expect(context.findSection('BREAKING CHANGES')).toBeDefined();

                done();
            });
        });
    });

    it('!important marker', (done): void => {
        const section = context.findSection('Important Internal Changes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                message: `feat(Jest): subject\n\n!important`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: 'keindev',
            });

            expect(commit.hasStatus(Status.Important)).toBeFalsy();

            plugin.parse(commit, task).then((): void => {
                expect(commit.hasStatus(Status.Important)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!deprecated marker', (done): void => {
        const section = context.findSection('DEPRECATIONS');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
                timestamp: 0,
                message: `feat(Jest): subject\n\n!deprecated`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
                author: 'keindev',
            });

            expect(commit.hasStatus(Status.Deprecated)).toBeFalsy();

            plugin.parse(commit, task).then((): void => {
                expect(commit.hasStatus(Status.Deprecated)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!break marker', (done): void => {
        const section = context.findSection('BREAKING CHANGES');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
                timestamp: 0,
                message: `feat(Jest): subject\n\n!break`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f3',
                author: 'keindev',
            });

            expect(commit.hasStatus(Status.BreakingChanges)).toBeFalsy();

            plugin.parse(commit, task).then((): void => {
                expect(commit.hasStatus(Status.BreakingChanges)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!hide marker', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!hide`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f4',
            author: 'keindev',
        });

        expect(commit.hasStatus(Status.Hidden)).toBeFalsy();

        plugin.parse(commit, task).then((): void => {
            expect(commit.hasStatus(Status.Hidden)).toBeTruthy();

            done();
        });
    });

    it('!group marker', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f5', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!group(Jest markers test)`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f5',
            author: 'keindev',
        });

        plugin.parse(commit, task).then((): void => {
            expect(context.getSections().length).toBe(4);
            expect(context.findSection('Jest markers test')).toBeDefined();

            done();
        });
    });
});
