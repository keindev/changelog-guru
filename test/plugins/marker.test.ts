import { Task } from 'tasktree-cli/lib/task';
import MarkerPlugin, { Config as MarkerConfig } from '../../src/plugins/marker';
import { TestContext } from '../__mocks__/context.mock';
import { Config } from '../../src/entities/config';
import Commit from '../../src/entities/commit';
import { Status } from '../../src/utils/enums';
import Section from '../../src/entities/section';

const config = new Config();
const context = new TestContext();
const plugin = new MarkerPlugin(context);
const task = new Task('test task');

describe('MarkerPlugin', (): void => {
    it('Create', (done): void => {
        config.load().then((): void => {
            plugin.init(config.getOptions() as MarkerConfig);

            expect(context.sections.size).toBe(3);
            expect(context.sections.has('Important Internal Changes')).toBeTruthy();
            expect(context.sections.has('DEPRECATIONS')).toBeTruthy();
            expect(context.sections.has('BREAKING CHANGES')).toBeTruthy();

            done();
        });
    });

    it('!important marker', (): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const section: Section = context.sections.get('Important Internal Changes') as any;
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!important`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: 'keindev',
        });

        expect(section).toBeDefined();
        expect(commit.hasStatus(Status.Important)).toBeFalsy();
        expect(section.getCommits().length).toBe(0);

        plugin.parse(commit, task);

        expect(context.sections.size).toBe(3);
        expect(commit.hasStatus(Status.Important)).toBeTruthy();
        expect(section.getCommits().length).toBe(1);
    });

    it('!deprecated marker', (): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const section: Section = context.sections.get('DEPRECATIONS') as any;
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!deprecated`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            author: 'keindev',
        });

        expect(section).toBeDefined();
        expect(commit.hasStatus(Status.Deprecated)).toBeFalsy();
        expect(section.getCommits().length).toBe(0);

        plugin.parse(commit, task);

        expect(context.sections.size).toBe(3);
        expect(commit.hasStatus(Status.Deprecated)).toBeTruthy();
        expect(section.getCommits().length).toBe(1);
    });

    it('!break marker', (): void => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const section: Section = context.sections.get('BREAKING CHANGES') as any;
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!break`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f3',
            author: 'keindev',
        });

        expect(section).toBeDefined();
        expect(commit.hasStatus(Status.BreakingChanges)).toBeFalsy();
        expect(section.getCommits().length).toBe(0);

        plugin.parse(commit, task);

        expect(context.sections.size).toBe(3);
        expect(commit.hasStatus(Status.BreakingChanges)).toBeTruthy();
        expect(section.getCommits().length).toBe(1);
    });

    it('!hide marker', (): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!hide`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f4',
            author: 'keindev',
        });

        expect(commit.hasStatus(Status.Hidden)).toBeFalsy();

        plugin.parse(commit, task);

        expect(context.sections.size).toBe(3);
        expect(commit.hasStatus(Status.Hidden)).toBeTruthy();
    });

    it('!group marker', (): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f5', {
            timestamp: 0,
            message: `feat(Jest): subject\n\n!group(Jest markers test)`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f5',
            author: 'keindev',
        });

        plugin.parse(commit, task);

        expect(context.sections.size).toBe(4);
        expect(context.sections.has('Jest markers test')).toBeTruthy();
    });
});
