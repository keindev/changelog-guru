import { State } from '../state';
import { Commit } from '../../entities/commit';
import { Author } from '../../entities/author';
import { SectionPosition } from '../../entities/section';
import { ConfigLoader } from '../../config/config-loader';
import { Config, ChangeLevel } from '../../config/config';

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
                state.setCommitTypes(config.getTypes());

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
});
