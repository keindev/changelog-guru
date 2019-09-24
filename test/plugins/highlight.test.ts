import { ConfigLoader } from '../../src/config/config-loader';
import { MockState } from '../__mocks__/state/state.mock';
import HighlightPlugin from '../../src/plugins/implementations/highlight';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';

// eslint-disable-next-line max-lines-per-function
describe('HighlightPlugin', (): void => {
    const $loader = new ConfigLoader();
    const $context = new MockState();
    const $plugin = new HighlightPlugin($context);
    const $author = new Author('keindev', {
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll((done): void => {
        $loader.load().then((config): void => {
            const options = config.getPlugin('highlight');

            if (options) {
                $plugin.init(options).then((): void => {
                    done();
                });
            } else {
                throw new Error('HighlightPlugin config not found!');
            }
        });
    });

    it('Generics highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): <subject>',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('`<subject>`');

            done();
        });
    });

    it('DollarSign highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): $subject',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('`$subject`');

            done();
        });
    });

    it('CliCommand highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): -subject --help --help-cli',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('`-subject` `--help` `--help-cli`');

            done();
        });
    });

    it('Dash highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): fix v-bind dynamic exhaustive-deps on slot outlets v-else-if',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('fix `v-bind` dynamic `exhaustive-deps` on slot outlets `v-else-if`');

            done();
        });
    });

    it('Dot highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): fix this.$slots and ctx.slots()',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('fix `this.$slots` and `ctx.slots()`');

            done();
        });
    });

    it('Enable camelCase highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): camelCase test',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('`camelCase` test');

            done();
        });
    });

    it('complex highlight', (done): void => {
        const commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            header: 'feat(Jest): fix this.$slots and ctx.slots() <slots> <slots>',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then((): void => {
            expect(commit.getSubject()).toBe('fix `this.$slots` and `ctx.slots()` `<slots>` `<slots>`');

            done();
        });
    });
});
