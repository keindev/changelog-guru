import Commit from '../../src/entities/commit';
import { Level, Priority, Status, Compare } from '../../src/utils/enums';

let commit: Commit;

describe('Commit', (): void => {
    beforeEach((): void => {
        commit = new Commit('b816518030dace1b91838ae0abd56fa88eba19f0', {
            timestamp: 21,
            message: `feat(Jest): subject\n\nbody\n\nfooter`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });
    });

    it('Create', (): void => {
        expect(commit.hash).toBe('b816518030dace1b91838ae0abd56fa88eba19f0');
        expect(commit.timestamp).toBe(21);
        expect(commit.url).toBe(
            'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0'
        );
        expect(commit.author).toBe('keindev');
        expect(commit.subject).toBe('subject');
        expect(commit.body.length).toBe(4);
        expect(commit.body).toStrictEqual(['', 'body', '', 'footer']);
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default);
        expect(commit.getType()).toBe('feat');
        expect(commit.getScope()).toBe('Jest');
        expect(commit.isIgnored()).toBeFalsy();
        expect(commit.getShortHash()).toBe('b816518');
    });

    it('Modify level', (): void => {
        expect(commit.getLevel()).toBe(Level.Patch);

        commit.setLevel(Level.Patch);
        expect(commit.getLevel()).toBe(Level.Patch);

        commit.setLevel(Level.Minor);
        expect(commit.getLevel()).toBe(Level.Minor);

        commit.setLevel(Level.Major);
        expect(commit.getLevel()).toBe(Level.Major);

        commit.setLevel(Level.Minor);
        expect(commit.getLevel()).toBe(Level.Minor);

        commit.setLevel(Level.Patch);
        expect(commit.getLevel()).toBe(Level.Patch);
    });

    it('Modify status', (): void => {
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();
        expect(commit.hasStatus(Status.BreakingChanges)).toBeFalsy();
        expect(commit.hasStatus(Status.Deprecated)).toBeFalsy();
        expect(commit.hasStatus(Status.Hidden)).toBeFalsy();
        expect(commit.hasStatus(Status.Important)).toBeFalsy();

        commit.setStatus(Status.Default);
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();

        commit.setStatus(Status.Important);
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default + Priority.Low);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();
        expect(commit.hasStatus(Status.Important)).toBeTruthy();

        commit.setStatus(Status.Hidden);
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default + Priority.Low);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();
        expect(commit.hasStatus(Status.Hidden)).toBeTruthy();
        expect(commit.hasStatus(Status.Important)).toBeTruthy();

        commit.setStatus(Status.Deprecated);
        expect(commit.getLevel()).toBe(Level.Minor);
        expect(commit.getPriority()).toBe(Priority.Default + Priority.Low + Priority.Medium);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();
        expect(commit.hasStatus(Status.Deprecated)).toBeTruthy();
        expect(commit.hasStatus(Status.Hidden)).toBeTruthy();
        expect(commit.hasStatus(Status.Important)).toBeTruthy();
        expect(commit.getLevel()).toBe(Level.Minor);

        commit.setStatus(Status.BreakingChanges);
        expect(commit.getLevel()).toBe(Level.Major);
        expect(commit.getPriority()).toBe(Priority.Default + Priority.Low + Priority.Medium + Priority.High);
        expect(commit.hasStatus(Status.Default)).toBeTruthy();
        expect(commit.hasStatus(Status.BreakingChanges)).toBeTruthy();
        expect(commit.hasStatus(Status.Deprecated)).toBeTruthy();
        expect(commit.hasStatus(Status.Hidden)).toBeTruthy();
        expect(commit.hasStatus(Status.Important)).toBeTruthy();
    });

    it('Accents', (): void => {
        expect(commit.getAccents()).toStrictEqual([]);

        commit.addAccent('test 1');
        expect(commit.getAccents()).toStrictEqual(['test 1']);

        commit.addAccent('test 1');
        commit.addAccent('test 2');
        expect(commit.getAccents()).toStrictEqual(['test 1', 'test 2']);
    });

    it('Ignore commit', (): void => {
        expect(commit.isIgnored()).toBeFalsy();

        commit.ignore();

        expect(commit.isIgnored()).toBeTruthy();
    });

    it('Compare commits', (): void => {
        const commit1 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f1', {
            timestamp: 0,
            message: `feat(Test): subject\n\nbody\n\nfooter`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });
        const commit2 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f2', {
            timestamp: 0,
            message: `feat(Test): subject\n\nbody\n\nfooter`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });
        const commit3 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f3', {
            timestamp: 0,
            message: `feat: subject\n\nbody\n\nfooter`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });
        const commit4 = new Commit('b816518030dace1b91838ae0abd56fa88eba19f4', {
            timestamp: 1,
            message: `feat: subject\n\nbody\n\nfooter`,
            url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
            author: 'keindev',
        });

        expect(Commit.compare(commit1, commit3)).toBe(Compare.Less);
        expect(Commit.compare(commit3, commit4)).toBe(Compare.Less);
        expect(Commit.compare(commit1, commit2)).toBe(Compare.Equal);
        expect(Commit.compare(commit3, commit1)).toBe(Compare.More);
    });
});
