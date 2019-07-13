import State from '../../src/entities/state';
import Commit from '../../src/entities/commit';
import Author from '../../src/entities/author';
import { Configuration } from '../../src/entities/configuration';
import { Position } from '../../src/entities/section';

const config = new Configuration();
const getAuthor = (id: number, login: string): Author =>
    new Author(id, {
        login,
        url: `https://github.com/${login}`,
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });
const getCommit = (id: number, message: string, author: Author): Commit =>
    new Commit(`b816518030dace1b91838ae0abd56fa88eba19f${id}`, {
        message,
        timestamp: 0,
        url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
        author: author.login,
    });

describe('State', (): void => {
    it('Create', (done): void => {
        config.load().then((): void => {
            const state = new State('1.0.0');
            const author1 = getAuthor(0, 'dev1');
            const author2 = getAuthor(1, 'dev2');
            const commit = getCommit(2, 'test(State): message3', author2);
            const section = state.addSection('header section', Position.Header);
            const emptySection = state.addSection('empty section', Position.Footer);
            const ignoredAuthor = getAuthor(2, 'dependabot-preview[bot]');
            const ignoredCommit = getCommit(3, 'build(deps): ignore this message', ignoredAuthor);

            state.addCommit(getCommit(0, 'test(State): message1', author1), author1);
            state.addCommit(getCommit(1, 'test(State): message2', author1), author1);
            section.assign(commit);
            state.addCommit(commit, author2);
            state.addCommit(ignoredCommit, ignoredAuthor);

            expect(state.getAuthors()).toStrictEqual([author1, author2, ignoredAuthor]);
            expect(state.getSections()).toStrictEqual([section, emptySection]);
            expect(state.getVersion()).toBe('1.0.0');
            expect(ignoredAuthor.isIgnored()).toBeFalsy();
            expect(ignoredCommit.isIgnored()).toBeFalsy();

            state.modify(config).then((): void => {
                expect(state.getSections()).toStrictEqual([section]);
                expect(ignoredAuthor.isIgnored()).toBeTruthy();
                expect(ignoredCommit.isIgnored()).toBeTruthy();

                done();
            });
        });
    });

    it('Find section', (): void => {
        const state = new State('1.1.1');
        const title = 'header section';
        const section = state.addSection(title, Position.Header);

        expect(state.findSection(title)).toStrictEqual(section);
        expect(state.findSection('')).toBeUndefined();
    });

    it('Change version', (): void => {
        const ver1 = '1.0.1';
        const ver2 = '1.2.0';
        const state = new State(ver1);

        state.setVersion(ver1);
        expect(state.getVersion()).toBe(ver1);

        state.setVersion(ver2);
        expect(state.getVersion()).toBe(ver2);

        state.setVersion(ver1);
        expect(state.getVersion()).toBe(ver2);
    });
});
