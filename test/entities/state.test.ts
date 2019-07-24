import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/entities/state.mock';
import { Commit } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { Configuration } from '../../src/entities/configuration';
import { Position } from '../../src/entities/section';
import { Level, FilterType } from '../../src/utils/enums';

describe('State', (): void => {
    const config = new Configuration();
    const task = new Task('test task');
    const getAuthor = (id: number, login: string): Author =>
        new Author(id, {
            login,
            url: `https://github.com/${login}`,
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
    const getCommit = (id: number, header: string, author: Author): Commit =>
        new Commit(`b816518030dace1b91838ae0abd56fa88eba19f${id}`, {
            header,
            timestamp: 0,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: author.login,
        });

    it('Default', (done): void => {
        config.load(task).then((): void => {
            const state = new MockState();
            const author1 = getAuthor(1, 'dev1');
            const author2 = getAuthor(2, 'dev2');
            const author3 = getAuthor(3, 'dependabot-preview[bot]');
            const commit1 = getCommit(1, 'feat(State): message1', author2);
            const commit2 = getCommit(2, 'test(State): message2', author1);
            const commit3 = getCommit(3, 'test(State): message3', author1);
            const commit4 = getCommit(4, 'build(deps): ignore this message', author3);
            const section1 = state.addSection('header section', Position.Header);
            const section2 = state.addSection('empty section', Position.Footer);

            expect(section1).toBeDefined();
            expect(section2).toBeDefined();

            if (section1 && section2) {
                state.addCommit(commit2, author1);
                state.addCommit(commit3, author1);
                state.addCommit(commit1, author2);
                state.addCommit(commit4, author3);
                section1.add(commit1);
                state.setLevels(config.getLevels());

                expect(state.getAuthors()).toStrictEqual([author1, author2, author3]);
                expect(state.getCommits()).toStrictEqual([commit4, commit2, commit3, commit1]);
                expect(state.getSections()).toStrictEqual([section1, section2]);
                expect(author3.isIgnored()).toBeFalsy();
                expect(commit4.isIgnored()).toBeFalsy();

                commit1.setLevel(Level.Major);
                state.ignoreAuthors(config.getFilters(FilterType.AuthorLogin));
                state.ignoreCommits(
                    config.getFilters(FilterType.CommitType),
                    config.getFilters(FilterType.CommitScope),
                    config.getFilters(FilterType.CommitSubject)
                );

                expect(state.getChangesLevels()).toStrictEqual([1, 0, 3]);
                expect(author3.isIgnored()).toBeTruthy();
                expect(commit4.isIgnored()).toBeTruthy();
                expect(state.getAuthors()).toStrictEqual([author1, author2]);
                expect(state.getCommits()).toStrictEqual([commit2, commit3, commit1]);

                state.modify([MockState.MOCK_PLUGIN_NAME], config.getOptions()).then((): void => {
                    expect(state.getSections()).toStrictEqual([section1]);

                    done();
                });
            }
        });
    });

    it('Add & find section', (): void => {
        const state = new MockState();
        const section = state.addSection('header section', Position.Header);

        expect(section).toBeDefined();

        if (section) {
            expect(state.findSection('header section')).toStrictEqual(section);
            expect(state.findSection('')).toBeUndefined();
        }
    });
});
