import { MockState } from '../__mocks__/state/state.mock';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { ConfigLoader } from '../../src/config/config-loader';
import { Config, ChangeLevel } from '../../src/config/config';
import { SectionPosition } from '../../src/entities/section';

describe('State', (): void => {
    const getAuthor = (login: string): Author =>
        new Author(login, {
            url: `https://github.com/${login}`,
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
    const getCommit = (id: number, header: string, author: Author): Commit =>
        new Commit(`b816518030dace1b91838ae0abd56fa88eba19f${id}`, {
            author,
            header,
            timestamp: 0,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
        });
    let $loader: ConfigLoader;
    let $config: Config;

    beforeAll((done): void => {
        $loader = new ConfigLoader();

        $loader.load().then((config): void => {
            $config = config;

            done();
        });
    });

    it('Default', (done): void => {
        const state = new MockState();
        const author1 = getAuthor('dev1');
        const author2 = getAuthor('dev2');
        const author3 = getAuthor('dependabot-preview[bot]');
        const commit1 = getCommit(1, 'feat(State): message1', author2);
        const commit2 = getCommit(2, 'test(State): message2', author1);
        const commit3 = getCommit(3, 'test(State): message3', author1);
        const commit4 = getCommit(4, 'build(deps): ignore this message', author3);
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
            state.setCommitTypes($config.getTypes());

            expect(state.getAuthors()).toStrictEqual([author1, author2, author3]);
            expect(state.getCommits()).toStrictEqual([commit4, commit2, commit3, commit1]);
            expect(state.getSections()).toStrictEqual([section1, section2]);
            expect(author3.isIgnored()).toBeFalsy();
            expect(commit4.isIgnored()).toBeFalsy();

            commit1.setChangeLevel(ChangeLevel.Major);
            state.ignoreEntities($config.getExclusions());

            expect(state.getChangesLevels()).toStrictEqual([1, 0, 3]);
            expect(author3.isIgnored()).toBeTruthy();
            expect(commit4.isIgnored()).toBeTruthy();
            expect(state.getAuthors()).toStrictEqual([author1, author2]);
            expect(state.getCommits()).toStrictEqual([commit2, commit3, commit1]);

            state.modify([['commit.mock', {}], ['state.mock', {}]]).then((): void => {
                expect(state.getSections()).toStrictEqual([section1]);

                done();
            });
        }
    });

    it('Add & find section', (): void => {
        const state = new MockState();
        const section = state.addSection('header section', SectionPosition.Header);

        expect(section).toBeDefined();

        if (section) {
            expect(state.findSection('header section')).toStrictEqual(section);
            expect(state.findSection('')).toBeUndefined();
        }
    });
});
