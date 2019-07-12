import Author from '../../src/entities/author';

describe('Author', (): void => {
    it('Create', (): void => {
        const author = new Author(1001, {
            login: 'keindev',
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });

        expect(author.id).toBe(1001);
        expect(author.getName()).toBe('@keindev');
        expect(author.login).toBe('keindev');
        expect(author.url).toBe('https://github.com/keindev');
        expect(author.getAvatar(20)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=20');
        expect(author.getAvatar()).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=40');
        expect(author.isIgnored()).toBeFalsy();
        expect(author.getContribution()).toBe(1);

        author.increaseContribution();
        author.increaseContribution();
        author.ignore();

        expect(author.isIgnored()).toBeTruthy();
        expect(author.getContribution()).toBe(3);
    });

    it('Avatar resize', (): void => {
        const author = new Author(1002, {
            login: 'keindev',
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4&size=20',
        });

        expect(author.getAvatar(60)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=60');
    });
});
