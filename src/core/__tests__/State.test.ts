import State from '../State';
import Commit from '../../entities/Commit';
import Author from '../../entities/Author';
import { SectionPosition } from '../../entities/Section';
import ConfigLoader from '../../config/ConfigLoader';
import Config, { ChangeLevel, ExclusionType } from '../../config/Config';

const loader = new ConfigLoader();
let config: Config;

describe('State', () => {
    beforeAll(done => {
        loader.load().then(defaultConfig => {
            config = defaultConfig;

            done();
        });
    });

    describe('Filing state', () => {
        it('A consistent state tree is formed', done => {
            const state = new State();
            const author1 = new Author({
                login: 'dev1',
                url: 'https://github.com/dev1',
                avatar: 'https://avatars3.githubusercontent.com/u/1?v=4',
            });
            const author2 = new Author({
                login: 'dev2',
                url: 'https://github.com/dev2',
                avatar: 'https://avatars3.githubusercontent.com/u/2?v=4',
            });
            const author3 = new Author({
                login: 'dependabot-preview[bot]',
                url: 'https://github.com/dependabot-preview[bot]',
                avatar: 'https://avatars3.githubusercontent.com/u/3?v=4',
            });
            const commit1 = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                author: author2,
                header: 'feat(State): message1',
                timestamp: 0,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            });
            const commit2 = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                author: author1,
                header: 'test(State): message2',
                timestamp: 0,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });
            const commit3 = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f3',
                author: author1,
                header: 'test(State): message3',
                timestamp: 0,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f3',
            });
            const commit4 = new Commit({
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f4',
                author: author3,
                header: 'build(deps): ignore this message',
                timestamp: 0,
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f4',
            });
            const section1 = state.addSection('header section', SectionPosition.Header);
            const section2 = state.addSection('empty section', SectionPosition.Footer);

            expect(section1).toBeDefined();
            expect(section2).toBeDefined();

            if (section1 && section2) {
                state.addCommit(commit2);
                state.addCommit(commit3);
                state.addCommit(commit1);
                state.addCommit(commit4);
                section1.add(commit1);
                state.updateCommitsChangeLevel(config.getTypes());

                expect(state.getAuthors()).toStrictEqual([author1, author2, author3]);
                expect(state.getCommits()).toStrictEqual([commit4, commit2, commit3, commit1]);
                expect(state.getSections()).toStrictEqual([section1, section2]);
                expect(author3.isIgnored()).toBeFalsy();
                expect(commit4.isIgnored()).toBeFalsy();

                commit1.setChangeLevel(ChangeLevel.Major);
                state.ignoreEntities(config.getExclusions());

                expect(state.getChangesLevels()).toStrictEqual([1, 0, 3]);
                expect(author3.isIgnored()).toBeTruthy();
                expect(commit4.isIgnored()).toBeTruthy();
                expect(state.getAuthors()).toStrictEqual([author1, author2]);
                expect(state.getCommits()).toStrictEqual([commit2, commit3, commit1]);

                state.modify([]).then(() => {
                    expect(state.getSections()).toStrictEqual([section1]);

                    done();
                });
            }
        });

        it('Added section found', () => {
            const state = new State();
            const section = state.addSection('header section', SectionPosition.Header);

            expect(section).toBeDefined();

            if (section) {
                expect(state.findSection('header section')).toStrictEqual(section);
                expect(state.findSection('')).toBeUndefined();
            }
        });
    });

    describe('Filter commits', () => {
        const state = new State();

        it('Filter authors by login', () => {
            const bot = new Author({
                login: 'bot',
                url: 'https://github.com/bot',
                avatar: 'https://avatars3.githubusercontent.com/u/0?v=4',
            });
            const author = new Author({
                login: 'dev1',
                url: 'https://github.com/dev1',
                avatar: 'https://avatars3.githubusercontent.com/u/1?v=4',
            });

            const A = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f1',
                timestamp: 1,
                header: 'feat(AAA): AAA',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f1',
            });

            const B = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(BBB): BBB',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            const C = new Commit({
                author,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'fix(CCC): CCC',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            const D = new Commit({
                author: bot,
                hash: 'b816518030dace1b91838ae0abd56fa88eba19f2',
                timestamp: 2,
                header: 'build(DDD): DDD',
                body: '',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f2',
            });

            state.addCommit(A);
            state.addCommit(B);
            state.addCommit(C);
            state.addCommit(D);

            state.ignoreEntities([[ExclusionType.AuthorLogin, ['bot']]]);
            expect(bot.isIgnored()).toBeTruthy();
            expect(author.isIgnored()).toBeFalsy();

            state.ignoreEntities([[ExclusionType.CommitType, ['fix']]]);
            expect(A.isIgnored()).toBeFalsy();
            expect(B.isIgnored()).toBeTruthy();
            expect(C.isIgnored()).toBeTruthy();
            expect(D.isIgnored()).toBeFalsy();

            state.ignoreEntities([[ExclusionType.CommitScope, ['AAA']]]);
            expect(A.isIgnored()).toBeTruthy();
            expect(B.isIgnored()).toBeTruthy();
            expect(C.isIgnored()).toBeTruthy();
            expect(D.isIgnored()).toBeFalsy();

            state.ignoreEntities([[ExclusionType.CommitSubject, ['DDD']]]);
            expect(A.isIgnored()).toBeTruthy();
            expect(B.isIgnored()).toBeTruthy();
            expect(C.isIgnored()).toBeTruthy();
            expect(D.isIgnored()).toBeTruthy();
        });
    });
});
