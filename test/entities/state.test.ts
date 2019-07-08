import State from '../../src/entities/state';
import Commit from '../../src/entities/commit';
import Author from '../../src/entities/author';
import { Config } from '../../src/entities/config';
import { Position } from '../../src/entities/section';

const VERSION = '1.0.0';
const config = new Config();
const getAuthor = (index: number): Author =>
    new Author(1001 + index, {
        login: `keindev${index}`,
        url: 'https://github.com/keindev',
        avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
    });
const getCommit = (index: number): Commit =>
    new Commit(`b816518030dace1b91838ae0abd56fa88eba19f${index}`, {
        timestamp: 0,
        message: `feat(test): message`,
        url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
        author: 'keindev',
    });

describe('State', (): void => {
    it('Create', (done): void => {
        const state = new State(VERSION);
        const author1 = getAuthor(0);
        const author2 = getAuthor(1);
        const commit = getCommit(3);
        const section = state.addSection('header section', Position.Header);
        const emptySection = state.addSection('empty section', Position.Footer);

        state.addCommit(getCommit(1), author1);
        state.addCommit(getCommit(2), author1);
        section.assign(commit);
        state.addCommit(commit, author2);

        expect(state.getAuthors()).toStrictEqual([author1, author2]);
        expect(state.getSections()).toStrictEqual([section, emptySection]);
        expect(state.getVersion()).toBe(VERSION);

        state.modify(config).then((): void => {
            expect(state.getSections()).toStrictEqual([section]);

            done();
        });
    });

    it('Find section', (): void => {
        const state = new State(VERSION);
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
