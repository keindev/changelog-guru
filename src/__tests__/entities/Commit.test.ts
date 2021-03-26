import faker from 'faker';

import Author from '../../core/entities/Author';
import Commit, { CommitChangeType } from '../../core/entities/Commit';
import { ChangeLevel, Compare, Priority } from '../../core/entities/Entity';

describe('Commit', () => {
  const login = faker.internet.userName();
  const hash = 'b816518030dace1b91838ae0abd56fa88eba19f';
  const timestamp = faker.random.number();
  const body = '\n\nbody\n\nfooter';
  const url = 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0';
  let author: Author;
  let commit: Commit;

  beforeAll(() => {
    author = new Author({
      login,
      avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
      url: `https://github.com/${login}`,
    });
    commit = new Commit({ author, hash, timestamp, body, url, headline: 'feat(Jest): subject' });
  });

  describe('Static methods', () => {
    it('Comparison is correct', () => {
      const options = { author, timestamp, body, url };
      const a = new Commit({ ...options, hash: `${hash}1`, headline: 'feat(Test): subject' });
      const b = new Commit({ ...options, hash: `${hash}2`, headline: 'feat(Test): subject' });
      const c = new Commit({ ...options, hash: `${hash}3`, headline: 'feat: subject' });
      const d = new Commit({ ...options, hash: `${hash}4`, headline: 'feat: subject', timestamp: timestamp + 1 });

      expect(Commit.compare(a, c)).toBe(Compare.Less);
      expect(Commit.compare(c, d)).toBe(Compare.Less);
      expect(Commit.compare(a, b)).toBe(Compare.Equal);
      expect(Commit.compare(c, a)).toBe(Compare.More);
    });
  });

  describe('Change commit', () => {
    it('Status will only change to a larger value', () => {
      commit.changeType = CommitChangeType.Default;
      expect(commit.level).toBe(ChangeLevel.Patch);
      expect(commit.priority).toBe(Priority.Low);
      expect(commit.is(CommitChangeType.Default)).toBeTruthy();

      commit.changeType = CommitChangeType.Important;
      expect(commit.level).toBe(ChangeLevel.Patch);
      expect(commit.priority).toBe(Priority.Low + Priority.Low);
      expect(commit.is(CommitChangeType.Default)).toBeTruthy();
      expect(commit.is(CommitChangeType.Important)).toBeTruthy();

      commit.changeType = CommitChangeType.Deprecated;
      expect(commit.level).toBe(ChangeLevel.Minor);
      expect(commit.priority).toBe(Priority.Low + Priority.Medium + Priority.Medium);
      expect(commit.is(CommitChangeType.Default)).toBeTruthy();
      expect(commit.is(CommitChangeType.Deprecated)).toBeTruthy();
      expect(commit.is(CommitChangeType.Important)).toBeTruthy();

      commit.changeType = CommitChangeType.BreakingChanges;
      expect(commit.level).toBe(ChangeLevel.Major);
      expect(commit.priority).toBe(Priority.Low + Priority.Medium + Priority.High + Priority.High);
      expect(commit.is(CommitChangeType.Default)).toBeTruthy();
      expect(commit.is(CommitChangeType.BreakingChanges)).toBeTruthy();
      expect(commit.is(CommitChangeType.Deprecated)).toBeTruthy();
      expect(commit.is(CommitChangeType.Important)).toBeTruthy();
    });

    it('Only unique accents added', () => {
      const a = faker.system.fileName();
      const b = faker.system.fileName();

      commit.accent(a);
      commit.accent(a);
      commit.accent(b);

      expect(commit.accents).toStrictEqual([a, b]);
    });
  });
});
