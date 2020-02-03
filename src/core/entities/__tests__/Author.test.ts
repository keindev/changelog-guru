import faker from 'faker';
import Author from '../Author';

const login = faker.internet.userName();
const url = `https://github.com/${login}`;
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
let author: Author;

describe('Author', () => {
    beforeEach(() => {
        author = new Author({ login, url, avatar });
    });

    describe('Create author', () => {
        it('Default options are set correctly', () => {
            expect(author.getName()).toBe(`@${login}`);
        });
    });

    describe('Change author info', () => {
        it('Contribution increased', () => {
            author.increaseContribution();
            author.increaseContribution();

            expect(author.getPriority()).toBe(3);
        });

        it('Avatar size changed', () => {
            const urls = [author.getAvatar(), author.getAvatar(20), author.getAvatar(60)];

            expect(urls).toMatchObject([`${avatar}&size=40`, `${avatar}&size=20`, `${avatar}&size=60`]);
        });
    });
});
