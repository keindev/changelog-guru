import faker from 'faker';
import { Commit, CommitStatus } from '../commit';
import { Author } from '../author';
import { ChangeLevel } from '../../config/config';
import { Compare, Priority } from '../../typings/enums';

const login = faker.internet.userName();
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
const authorUrl = `https://github.com/${login}`;
const hash = 'b816518030dace1b91838ae0abd56fa88eba19f';
const timestamp = 0;
const body = '\n\nbody\n\nfooter';
const commitUrl = 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0';
let author: Author;
let commit: Commit;

describe('Commit', () => {
    beforeAll(() => {
        author = new Author({ login, avatar, url: authorUrl });
        commit = new Commit({ author, hash, timestamp, body, url: commitUrl, header: 'feat(Jest): subject' });
    });

    describe('Static methods', () => {
        it('Comparison is correct', () => {
            const options = { author, timestamp, body, url: commitUrl };
            const a = new Commit({ ...options, hash: `${hash}1`, header: 'feat(Test): subject' });
            const b = new Commit({ ...options, hash: `${hash}2`, header: 'feat(Test): subject' });
            const c = new Commit({ ...options, hash: `${hash}3`, header: 'feat: subject' });
            const d = new Commit({ ...options, hash: `${hash}4`, header: 'feat: subject', timestamp: 1 });

            expect(Commit.compare(a, c)).toBe(Compare.Less);
            expect(Commit.compare(c, d)).toBe(Compare.Less);
            expect(Commit.compare(a, b)).toBe(Compare.Equal);
            expect(Commit.compare(c, a)).toBe(Compare.More);
        });

        it('Header split to [type, scope, subject]', () => {
            const [type, scope, subject] = Commit.splitHeader('feat(Test): subject');

            expect(type).toBe('feat');
            expect(scope).toBe('Test');
            expect(subject).toBe('subject');
        });
    });

    describe('Change commit', () => {
        it('Status will only change to a larger value', () => {
            commit.setStatus(CommitStatus.Default);
            expect(commit.getChangeLevel()).toBe(ChangeLevel.Patch);
            expect(commit.getPriority()).toBe(Priority.Low);
            expect(commit.hasStatus(CommitStatus.Default)).toBeTruthy();

            commit.setStatus(CommitStatus.Important);
            expect(commit.getChangeLevel()).toBe(ChangeLevel.Patch);
            expect(commit.getPriority()).toBe(Priority.Low + Priority.Low);
            expect(commit.hasStatus(CommitStatus.Default)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.Important)).toBeTruthy();

            commit.setStatus(CommitStatus.Deprecated);
            expect(commit.getChangeLevel()).toBe(ChangeLevel.Minor);
            expect(commit.getPriority()).toBe(Priority.Low + Priority.Medium + Priority.Medium);
            expect(commit.hasStatus(CommitStatus.Default)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.Deprecated)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.Important)).toBeTruthy();

            commit.setStatus(CommitStatus.BreakingChanges);
            expect(commit.getChangeLevel()).toBe(ChangeLevel.Major);
            expect(commit.getPriority()).toBe(Priority.Low + Priority.Medium + Priority.High + Priority.High);
            expect(commit.hasStatus(CommitStatus.Default)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.BreakingChanges)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.Deprecated)).toBeTruthy();
            expect(commit.hasStatus(CommitStatus.Important)).toBeTruthy();
        });

        it('Only unique accents added', () => {
            const a = faker.system.fileName();
            const b = faker.system.fileName();

            commit.addAccent(a);
            commit.addAccent(a);
            commit.addAccent(b);

            expect(commit.getAccents()).toStrictEqual([a, b]);
        });
    });
});
