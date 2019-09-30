import faker from 'faker';
import { Reader } from '../reader';
import { Package } from '../../package/package';
import { ServiceProvider } from '../../config/config';
import { GitHubProvider } from '../../providers/github-provider';
import { Commit } from '../../entities/commit';
import { Author } from '../../entities/author';

jest.mock('../../providers/github-provider');

const login = faker.internet.userName();
const commitUrl = 'https://github.com/keindev/changelog-guru/commit/b816518030dace1b91838ae0abd56fa88eba19f0';
const avatar = 'https://avatars3.githubusercontent.com/u/4527292?v=4';
const hash = 'b816518030dace1b91838ae0abd56fa88eba19f';
const author = new Author({ login, url: `https://github.com/${login}`, avatar });
const date = new Date();
const commits = [
    new Commit({ author, url: commitUrl, hash: `${hash}1`, header: 'test: subject 1', timestamp: 0 }),
    new Commit({ author, url: commitUrl, hash: `${hash}2`, header: 'test: subject 2', timestamp: 1 }),
];

describe('Reader', (): void => {
    beforeEach((): void => {
        jest.resetAllMocks();
    });

    describe('Read state', () => {
        it('Package and git meta data will be read to State object', (done): void => {
            const provider = new GitHubProvider(
                ServiceProvider.GitHub,
                'https://github.com/keindev/changelog-guru.git'
            ) as jest.Mocked<GitHubProvider>;
            const reader = new Reader(provider);
            const pkg = new Package();

            provider.getCommitsCount.mockImplementation(() => Promise.resolve(commits.length));
            provider.getCommits.mockImplementation(() => Promise.resolve(commits));
            provider.getLastRelease.mockImplementation(() => Promise.resolve({ tag: undefined, date }));
            provider.getPrevPackage.mockImplementation(() => Promise.resolve({ license: 'MIT' }));

            reader.read(pkg).then((state): void => {
                expect(state.getAuthors()).toStrictEqual([author]);
                expect(state.getCommits()).toStrictEqual(commits);

                done();
            });
        });
    });
});
