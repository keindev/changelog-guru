// @see https://github.com/facebook/jest/issues/9430
// eslint-disable-next-line node/no-extraneous-import
import { jest } from '@jest/globals';
import { default as GQLCommit } from 'gh-gql/lib/queries/Commit';
import { default as GQLFile } from 'gh-gql/lib/queries/File';

import Author from '../../core/entities/Author.js';
import Commit from '../../core/entities/Commit.js';
import GitHubProvider from '../../core/providers/GitHubProvider.js';

jest.useFakeTimers();

const lastCommitData = {
  commitUrl: 'https://github.com/keindev/changelog-guru/commit/779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
  committedDate: new Date(0).toISOString(),
  committer: { name: 'keindev' },
};
const commitData = {
  oid: '779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
  messageHeadline: 'fix: test',
  messageBody: 'Merge branch master into dev',
  url: lastCommitData.commitUrl,
  committedDate: lastCommitData.committedDate,
  author: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/4527292?v=4',
    user: {
      databaseId: 1,
      login: lastCommitData.committer.name,
      url: 'https://github.com/keindev',
    },
  },
};
const fileId = '779ed9b4803da533c1d55f26e5cc7d58ff3d47b6';
const fileData = {
  name: 'changelog-guru',
  version: '3.0.1',
  description: 'Git changelog generator',
  homepage: 'https://github.com/keindev/changelog-guru#readme',
  license: 'MIT',
};

jest.spyOn(GQLCommit.prototype, 'getLastCommit').mockImplementation(() => Promise.resolve(lastCommitData));
jest.spyOn(GQLCommit.prototype, 'getList').mockImplementation(() => Promise.resolve([commitData]));
jest.spyOn(GQLFile.prototype, 'getId').mockImplementation(() => Promise.resolve(fileId));
jest.spyOn(GQLFile.prototype, 'getContent').mockImplementation(() => Promise.resolve(JSON.stringify(fileData)));

describe('GitHubProvider', () => {
  const provider = new GitHubProvider('https://github.com/keindev/changelog-guru');

  it('Get last change date', async () => {
    const date = await provider.getLastChangeDate();

    expect(date.toISOString()).toBe(lastCommitData.committedDate);
  });

  it('Get commits', async () => {
    const commits = await provider.getCommits(new Date(lastCommitData.committedDate));

    expect([
      new Commit({
        hash: commitData.oid,
        headline: commitData.messageHeadline,
        body: commitData.messageBody,
        author: new Author({
          login: commitData.author.user.login,
          url: commitData.author.user.url,
          avatar: commitData.author.avatarUrl,
        }),
        timestamp: new Date(commitData.committedDate).getTime(),
        url: commitData.url,
      }),
    ]).toStrictEqual(commits);
  });

  it('Get package', async () => {
    const previousPackage = await provider.getPreviousPackage(new Date(lastCommitData.committedDate));
    const currentPackage = await provider.getCurrentPackage(new Date(lastCommitData.committedDate));

    expect(previousPackage).toStrictEqual(currentPackage);
  });
});
