import * as commit from '../utils/commit';
import * as text from '../utils/text';

describe('Utils', () => {
  describe('commit', () => {
    it('Header split to [type, scope, subject]', () => {
      const [type, scope, subject] = commit.splitHeadline('feat(Test): subject');

      expect(type).toBe('feat');
      expect(scope).toBe('Test');
      expect(subject).toBe('subject');
    });
  });

  describe('text', () => {
    it('Unify', () => {
      expect(text.unify('')).toBe('');
      expect(text.unify('   ')).toBe('');
      expect(text.unify(' TEST ')).toBe('test');
    });

    it('findSame', () => {
      expect(text.findSame('feat', ['fear', 'test'])).toBeTruthy();
      expect(text.findSame('feat', ['feed', 'test'])).toBeFalsy();
      expect(text.findSame('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('isSame', () => {
      expect(text.isSame('1234', '123x')).toBeTruthy();
      expect(text.isSame('1234', '12xx')).toBeFalsy();
      expect(text.isSame('1234567', '123456x')).toBeTruthy();
      expect(text.isSame('1234567', '12345xx')).toBeFalsy();
    });
  });
});
