import { Author } from '../../src/entities/author';
import { Entity } from '../../src/entities/entity';

describe('Author', (): void => {
    let $author: Author;

    beforeEach((): void => {
        $author = new Author('keindev', {
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
    });

    it('Default', (): void => {
        expect($author instanceof Entity).toBeTruthy();
        expect($author.getName()).toBe('@keindev');
        expect($author.url).toBe('https://github.com/keindev');
    });

    it('Change contribution', (): void => {
        expect($author.getPriority()).toBe(1);

        $author.increaseContribution();
        $author.increaseContribution();

        expect($author.getPriority()).toBe(3);
    });

    it('Avatar resize', (): void => {
        expect($author.getAvatar(20)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=20');
        expect($author.getAvatar()).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=40');
        expect($author.getAvatar(60)).toBe('https://avatars3.githubusercontent.com/u/4527292?v=4&size=60');
    });
});
