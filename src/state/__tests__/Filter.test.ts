import Author from '../../entities/Author';
import Commit from '../../entities/Commit';
import Filter from '../Filter';

const author = new Author({
    login: 'keindev',
    url: 'https://github.com/keindev',
    avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
});

describe('Filter', () => {
    describe('Static methods', () => {
        it('Filter authors by login', () => {
            const bot = new Author({
                login: 'bot',
                url: 'https://github.com/bot',
                avatar: 'https://avatars3.githubusercontent.com/u/0?v=4',
            });

            Filter.authorsByLogin(
                new Map([
                    [bot.getName(), bot],
                    [author.getName(), author],
                ]),
                ['bot']
            );

            expect(bot.isIgnored()).toBeTruthy();
            expect(author.isIgnored()).toBeFalsy();
        });

        it('Filter commits by type', () => {
            const a = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            });
            const b = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            Filter.commitsByType(
                new Map([
                    [a.getName(), a],
                    [b.getName(), b],
                ]),
                ['fix']
            );

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });

        it('Filter commits by Scope', () => {
            const a = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            });
            const b = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            Filter.commitsByScope(
                new Map([
                    [a.getName(), a],
                    [b.getName(), b],
                ]),
                ['BBB']
            );

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });

        it('Filter commits by Subject', () => {
            const a = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            });
            const b = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            Filter.commitsBySubject(
                new Map([
                    [a.getName(), a],
                    [b.getName(), b],
                ]),
                ['BBB']
            );

            expect(a.isIgnored()).toBeFalsy();
            expect(b.isIgnored()).toBeTruthy();
        });
    });
});
