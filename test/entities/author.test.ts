import Author, { AuthorOptions } from '../../src/entities/author';

const ID = 1001;
const AVATAR_SIZE = 20;
const OPTIONS: AuthorOptions = {
    login: 'keindev',
    url: 'https://github.com/keindev',
    avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
};

describe('Author', (): void => {
    it('Create', (): void => {
        const author = new Author(ID, OPTIONS);

        expect(author.id).toBe(ID);
        expect(author.getName()).toBe(Author.NAME_PREFIX + OPTIONS.login);
        expect(author.login).toBe(OPTIONS.login);
        expect(author.url).toBe(OPTIONS.url);
        expect(author.getAvatar(AVATAR_SIZE)).toBe(`${OPTIONS.avatar}&size=${AVATAR_SIZE}`);
        expect(author.getAvatar()).toBe(`${OPTIONS.avatar}&size=${Author.AVATAR_SIZE}`);
        expect(author.isIgnored()).toBeFalsy();
        expect(author.getContribution()).toBe(1);

        author.increaseContribution();
        author.increaseContribution();
        author.ignore();

        expect(author.isIgnored()).toBeTruthy();
        expect(author.getContribution()).toBe(3);
    });

    it('Avatar resize', (): void => {
        const author = new Author(ID, {
            login: OPTIONS.login,
            url: OPTIONS.url,
            avatar: `${OPTIONS.avatar}&size=${AVATAR_SIZE}`,
        });

        expect(author.getAvatar(AVATAR_SIZE * 2)).toBe(`${OPTIONS.avatar}&size=${AVATAR_SIZE * 2}`);
    });
});
