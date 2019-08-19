import { Commit, CommitStatus } from '../../src/entities/commit';
import { Author } from '../../src/entities/author';
import { Compare, Priority } from '../../src/typings/enums';
import { Entity } from '../../src/entities/entity';
import { ChangeLevel } from '../../src/config/config';

describe('Commit', (): void => {
    let $author: Author;
    let $commit: Commit;

    beforeAll((): void => {
        $author = new Author('keindev', {
            url: 'https://github.com/keindev',
            avatar: 'https://avatars3.githubusercontent.com/u/4527292?v=4',
        });
        $commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 21,
            header: 'feat(Jest): subject',
            body: '\n\nbody\n\nfooter',
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: $author,
        });
    });

    describe('Static', (): void => {
        it('Compare', (): void => {
            const a = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
                timestamp: 0,
                header: 'feat(Test): subject',
                body: '\n\nbody\n\nfooter',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
                author: $author,
            });
            const b = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
                timestamp: 0,
                header: 'feat(Test): subject',
                body: '\n\nbody\n\nfooter',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
                author: $author,
            });
            const c = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
                timestamp: 0,
                header: 'feat: subject',
                body: '\n\nbody\n\nfooter',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
                author: $author,
            });
            const d = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
                timestamp: 1,
                header: 'feat: subject',
                body: '\n\nbody\n\nfooter',
                url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
                author: $author,
            });

            expect(Commit.compare(a, c)).toBe(Compare.Less);
            expect(Commit.compare(c, d)).toBe(Compare.Less);
            expect(Commit.compare(a, b)).toBe(Compare.Equal);
            expect(Commit.compare(c, a)).toBe(Compare.More);
        });
    });

    it('Default', (): void => {
        expect($commit instanceof Entity).toBeTruthy();
        expect($commit.timestamp).toBe(21);
        expect($commit.getSubject()).toBe('subject');
        expect($commit.body).toStrictEqual(['', '', 'body', '', 'footer']);
        expect($commit.author).toStrictEqual($author);
        expect($commit.url).toBe(
            'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0'
        );
        expect($commit.getTypeName()).toBe('feat');
        expect($commit.getScope()).toBe('Jest');
    });

    it('Change status', (): void => {
        expect($commit.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($commit.getPriority()).toBe(Priority.Low);
        expect($commit.hasStatus(CommitStatus.Default)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.BreakingChanges)).toBeFalsy();
        expect($commit.hasStatus(CommitStatus.Deprecated)).toBeFalsy();
        expect($commit.hasStatus(CommitStatus.Important)).toBeFalsy();

        $commit.setStatus(CommitStatus.Default);
        expect($commit.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($commit.getPriority()).toBe(Priority.Low);
        expect($commit.hasStatus(CommitStatus.Default)).toBeTruthy();

        $commit.setStatus(CommitStatus.Important);
        expect($commit.getChangeLevel()).toBe(ChangeLevel.Patch);
        expect($commit.getPriority()).toBe(Priority.Low + Priority.Low);
        expect($commit.hasStatus(CommitStatus.Default)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.Important)).toBeTruthy();

        $commit.setStatus(CommitStatus.Deprecated);
        expect($commit.getChangeLevel()).toBe(ChangeLevel.Minor);
        expect($commit.getPriority()).toBe(Priority.Low + Priority.Medium + Priority.Medium);
        expect($commit.hasStatus(CommitStatus.Default)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.Deprecated)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.Important)).toBeTruthy();

        $commit.setStatus(CommitStatus.BreakingChanges);
        expect($commit.getChangeLevel()).toBe(ChangeLevel.Major);
        expect($commit.getPriority()).toBe(Priority.Low + Priority.Medium + Priority.High + Priority.High);
        expect($commit.hasStatus(CommitStatus.Default)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.BreakingChanges)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.Deprecated)).toBeTruthy();
        expect($commit.hasStatus(CommitStatus.Important)).toBeTruthy();
    });

    it('Accents', (): void => {
        expect($commit.getAccents()).toStrictEqual([]);

        $commit.addAccent('test 1');
        $commit.addAccent('test 1');
        $commit.addAccent('test 2');

        expect($commit.getAccents()).toStrictEqual(['test 1', 'test 2']);
    });
});
