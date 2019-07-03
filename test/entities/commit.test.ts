import Commit, { CommitOptions } from '../../src/entities/commit';
import { Level, Priority } from '../../src/utils/enums';

const HASH = 'b816518030dace1b91838ae0abd56fa88eba19f0';
const TYPE = 'feat';
const SCOPE = 'test';
const SUBJECT = 'subject';
const MESSAGE = `${SUBJECT}\n\nbody\n\nfooter`;
const OPTIONS: CommitOptions = {
    timestamp: 0,
    message: `${TYPE}(${SCOPE}): ${MESSAGE}`,
    url: 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0',
    author: 'keindev',
};
let commit: Commit;

describe('Commit', (): void => {
    beforeEach((): void => {
        commit = new Commit(HASH, OPTIONS);
    });

    it('Create', (): void => {
        expect(commit.hash).toBe(HASH);
        expect(commit.timestamp).toBe(OPTIONS.timestamp);
        expect(commit.url).toBe(OPTIONS.url);
        expect(commit.author).toBe(OPTIONS.author);
        expect(commit.subject).toBe(SUBJECT);
        expect(commit.body.length).toBe(4);
        expect(commit.body).toStrictEqual(['', 'body', '', 'footer']);
        expect(commit.getLevel()).toBe(Level.Patch);
        expect(commit.getPriority()).toBe(Priority.Default);
        expect(commit.getType()).toBe(TYPE);
        expect(commit.getScope()).toBe(SCOPE);
        expect(commit.isIgnored()).toBeFalsy();
        expect(commit.getShortHash()).toBe('b816518');
    });

    // TODO: other branches
});
