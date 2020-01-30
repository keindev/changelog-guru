import HighlightPlugin from '../HighlightPlugin';
import ConfigLoader from '../../../config/ConfigLoader';
import Commit from '../../../entities/Commit';
import Author from '../../../entities/Author';
import State from '../../../state/State';

describe('HighlightPlugin', () => {
    const $loader = new ConfigLoader();
    const $context = new State();
    const $plugin = new HighlightPlugin($context);
    const $author = new Author({
        login: 'keindev',
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    beforeAll(done => {
        $loader.load().then(config => {
            const options = config.getPlugin('highlight');

            if (options) {
                $plugin.init(options).then(() => {
                    done();
                });
            } else {
                throw new Error('HighlightPlugin config not found!');
            }
        });
    });

    it('Generics highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): <subject>',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('`<subject>`');

            done();
        });
    });

    it('DollarSign highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): $subject',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('`$subject`');

            done();
        });
    });

    it('CliCommand highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): -subject --help --help-cli',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('`-subject` `--help` `--help-cli`');

            done();
        });
    });

    it('Dash highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): fix v-bind dynamic exhaustive-deps on slot outlets v-else-if',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('fix `v-bind` dynamic `exhaustive-deps` on slot outlets `v-else-if`');

            done();
        });
    });

    it('Dot highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): fix this.$slots and ctx.slots()',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('fix `this.$slots` and `ctx.slots()`');

            done();
        });
    });

    it('Enable camelCase highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): camelCase test',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('`camelCase` test');

            done();
        });
    });

    it('complex highlight', done => {
        const commit = new Commit({
            hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
            timestamp: 0,
            header: 'feat(Jest): fix this.$slots and ctx.slots() <slots> <slots>',
            body: `jest highlight test`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            author: $author,
        });

        $plugin.parse(commit).then(() => {
            expect(commit.getSubject()).toBe('fix `this.$slots` and `ctx.slots()` `<slots>` `<slots>`');

            done();
        });
    });
});
