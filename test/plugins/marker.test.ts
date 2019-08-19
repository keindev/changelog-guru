import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state/state.mock';
import MarkerPlugin, { MarkerPluginOptions } from '../../src/plugins/implementations/marker';
import { ConfigLoader } from '../../src/config/config-loader';
import { Commit, CommitStatus } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';

describe('MarkerPlugin', (): void => {
    const $loader = new ConfigLoader();
    const $context = new MockState();
    const $plugin = new MarkerPlugin($context);
    const $task = new Task('test task');
    const $author = new Author('keindev', {
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll((done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('marker');

            if (options) {
                $plugin.init(options as MarkerPluginOptions).then((): void => {
                    done();
                });
            } else {
                throw new Error('MarkerPlugin config not found!');
            }
        });
    });

    it('Default', (): void => {
        expect($context.getSections().length).toBe(3);
        expect($context.findSection('Important Internal Changes')).toBeDefined();
        expect($context.findSection('DEPRECATIONS')).toBeDefined();
        expect($context.findSection('BREAKING CHANGES')).toBeDefined();
    });

    it('Lint', (): void => {
        let task = new Task('lint');
        const options = {
            header: 'test(scope): subject',
            type: 'test',
            scope: 'scope',
            subject: 'subject',
        };

        $plugin.lint(Object.assign(options, { body: [''] }), task);
        $plugin.lint(Object.assign(options, { body: ['!group(name)'] }), task);
        $plugin.lint(Object.assign(options, { body: ['!important !deprecated !break !ignore', '', 'text'] }), task);

        expect(task.haveErrors()).toBeFalsy();

        $plugin.lint(Object.assign(options, { body: ['text'] }), task);

        expect(task.haveErrors()).toBeTruthy();

        task = new Task('lint');
        $plugin.lint(Object.assign(options, { body: ['!group'] }), task);

        expect(task.haveErrors()).toBeTruthy();
    });

    it('!important marker', (done): void => {
        const section = $context.findSection('Important Internal Changes');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                header: 'feat(Jest): subject',
                body: `!important`,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });

            expect(commit.hasStatus(CommitStatus.Important)).toBeFalsy();

            $plugin.parse(commit, $task).then((): void => {
                expect(commit.hasStatus(CommitStatus.Important)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!deprecated marker', (done): void => {
        const section = $context.findSection('DEPRECATIONS');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
                timestamp: 0,
                header: 'feat(Jest): subject',
                body: '!deprecated',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
                author: $author,
            });

            expect(commit.hasStatus(CommitStatus.Deprecated)).toBeFalsy();

            $plugin.parse(commit, $task).then((): void => {
                expect(commit.hasStatus(CommitStatus.Deprecated)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!break marker', (done): void => {
        const section = $context.findSection('BREAKING CHANGES');

        expect(section).toBeDefined();

        if (section) {
            const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
                timestamp: 0,
                header: 'feat(Jest): subject',
                body: '!break',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f3',
                author: $author,
            });

            expect(commit.hasStatus(CommitStatus.BreakingChanges)).toBeFalsy();

            $plugin.parse(commit, $task).then((): void => {
                expect(commit.hasStatus(CommitStatus.BreakingChanges)).toBeTruthy();
                expect(section.getCommits()).toStrictEqual([commit]);

                done();
            });
        }
    });

    it('!ignore marker', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
            timestamp: 0,
            header: 'feat(Jest): subject',
            body: '!ignore',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f4',
            author: $author,
        });

        expect(commit.isIgnored()).toBeFalsy();

        $plugin.parse(commit, $task).then((): void => {
            expect(commit.isIgnored()).toBeTruthy();

            done();
        });
    });

    it('!group marker', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f5', {
            timestamp: 0,
            header: 'feat(Jest): subject',
            body: '!group(Jest markers test)',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f5',
            author: $author,
        });

        $plugin.parse(commit, $task).then((): void => {
            expect($context.getSections().length).toBe(4);
            expect($context.findSection('Jest markers test')).toBeDefined();

            done();
        });
    });
});
