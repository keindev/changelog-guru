import faker from 'faker';

import Author from '../../core/entities/Author';

describe('Author', () => {
  const login = faker.internet.userName();
  const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
  let author: Author;

  beforeEach(() => {
    author = new Author({ login, avatar, url: `https://github.com/${login}` });
  });

  describe('Create author', () => {
    it('Default options are set correctly', () => {
      expect(author.name).toBe(`@${login}`);
    });
  });

  describe('Change author info', () => {
    it('Contribution increased', () => {
      author.contribute();
      author.contribute();

      expect(author.priority).toBe(3);
    });

    it('Avatar size changed', () => {
      expect(author.avatar).toBe(`${avatar}&s=40`);
    });
  });
});
