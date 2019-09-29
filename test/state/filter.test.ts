import { Filter } from '../../src/state/filter';
import { Author } from '../../src/entities/author';
import { Commit } from '../../src/entities/commit';

// eslint-disable-next-line max-lines-per-function
describe('Filter', (): void => {
    const $author = new Author({
        login: 'keindev',
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });

    // eslint-disable-next-line max-lines-per-function
    describe('Static', (): void => {
        it('Filter authors by login', (): void => {
            const bot = new Author({
                login: 'bot',
                url: 'https://github.com/keindev',
                avatar: 'https://avatars3.githubusercontent.com/u/0?v=4',
            });

            Filter.authorsByLogin(new Map([[bot.getName(), bot], [$author.getName(), $author]]), ['bot']);

            expect(bot.isIgnored()).toBeTruthy();
            expect($author.isIgnored()).toBeFalsy();
        });

        it('Filter commits by type', (): void => {
            const a = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });
            const b = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
                author: $author,
            });

            Filter.commitsByType(new Map([[a.getName(), a], [b.getName(), b]]), ['fix']);

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });

        it('Filter commits by Scope', (): void => {
            const a = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });
            const b = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
                author: $author,
            });

            Filter.commitsByScope(new Map([[a.getName(), a], [b.getName(), b]]), ['BBB']);

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });

        it('Filter commits by Subject', (): void => {
            const a = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
                author: $author,
            });
            const b = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
                author: $author,
            });

            Filter.commitsBySubject(new Map([[a.getName(), a], [b.getName(), b]]), ['BBB']);

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });
    });
});
