import { Author } from '../../src/entities/author';

describe('Author', (): void => {
    let author: Author;

    beforeEach((): void => {
        author = new Author(1, {
            login: 'keindev',
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
    });

    it('Default', (): void => {
        expect(author.id).toBe(1);
        expect(author.getName()).toBe('@keindev');
        expect(author.login).toBe('keindev');
        expect(author.url).toBe('https://github.com/keindev');
    });

    it('Change contribution', (): void => {
        expect(author.getContribution()).toBe(1);

        author.increaseContribution();
        author.increaseContribution();

        expect(author.getContribution()).toBe(3);
    });

    it('Compare', (): void => {
        const author1 = new Author(1, {
            login: 'keindev1',
            url: 'https://github.com/keindev1',
            avatar: 'https://avatars3.githubusercontent.com/u/4527291?v=4',
        });
        const author2 = new Author(2, {
            login: 'keindev2',
            url: 'https://github.com/keindev2',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });

        author1.increaseContribution();

        expect(Author.compare(author, author)).toBe(0);
        expect(Author.compare(author1, author2)).toBe(-1);
        expect(Author.compare(author2, author1)).toBe(1);
    });

    it('Ignore & filter', (): void => {
        expect(author.isIgnored()).toBeFalsy();
        expect(Author.filter(author)).toBeTruthy();

        author.ignore();

        expect(author.isIgnored()).toBeTruthy();
        expect(Author.filter(author)).toBeFalsy();
    });

    it('Avatar resize', (): void => {
        expect(author.getAvatar(20)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=20');
        expect(author.getAvatar()).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=40');
        expect(author.getAvatar(60)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=60');
    });
});
