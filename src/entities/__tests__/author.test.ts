import faker from 'faker';
import { Author } from '../author';

const login = faker.internet.userName();
const url = `https://github.com/${login}`;
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
let author: Author;

describe('Author', (): void => {
    beforeEach((): void => {
        author = new Author({ login, url, avatar });
    });

    describe('Create author', (): void => {
        it('Default options are set correctly', (): void => {
            expect(author.getName()).toBe(`@${login}`);
        });
    });

    describe('Change author info', (): void => {
        it('Contribution increased', (): void => {
            author.increaseContribution();
            author.increaseContribution();

            expect(author.getPriority()).toBe(3);
        });

        it('Avatar size changed', (): void => {
            const urls = [author.getAvatar(), author.getAvatar(20), author.getAvatar(60)];

            expect(urls).toMatchObject([`${avatar}&size=40`, `${avatar}&size=20`, `${avatar}&size=60`]);
        });
    });
});
