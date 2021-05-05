import { splitHeadline } from '../utils/commit';
import { findSame, isSame, unify } from '../utils/text';

describe('Utils', () => {
  describe('commit', () => {
    it('Header split to [type, scope, subject]', () => {
      const [type, scope, subject] = splitHeadline('feat(Test): subject');

      expect(type).toBe('feat');
      expect(scope).toBe('Test');
      expect(subject).toBe('subject');
    });
  });

  describe('text', () => {
    it('Unify', () => {
      expect(unify('')).toBe('');
      expect(unify('   ')).toBe('');
      expect(unify(' TEST ')).toBe('test');
    });

    it('findSame', () => {
      expect(findSame('feat', ['fear', 'test'])).toBeTruthy();
      expect(findSame('feat', ['feed', 'test'])).toBeFalsy();
      expect(findSame('feat', ['fix', 'test'])).toBeFalsy();
    });

    it('isSame', () => {
      expect(isSame('1234', '123x')).toBeTruthy();
      expect(isSame('1234', '12xx')).toBeFalsy();
      expect(isSame('1234567', '123456x')).toBeTruthy();
      expect(isSame('1234567', '12345xx')).toBeFalsy();
    });
  });
});
