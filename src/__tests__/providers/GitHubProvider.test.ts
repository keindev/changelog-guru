import faker from 'faker';
import { default as GQLCommit } from 'gh-gql/lib/queries/Commit';
import { default as GQLFile } from 'gh-gql/lib/queries/File';

import Author from '../../core/entities/Author';
import Commit from '../../core/entities/Commit';
import GitHubProvider from '../../core/providers/GitHubProvider';

const lastCommitData = {
  commitUrl: faker.internet.url(),
  committedDate: new Date(0).toISOString(),
  committer: { name: faker.internet.userName() },
};
const commitData = {
  oid: faker.git.commitSha(),
  messageHeadline: 'fix: test',
  messageBody: faker.git.commitMessage(),
  url: lastCommitData.commitUrl,
  committedDate: lastCommitData.committedDate,
  author: {
    avatarUrl: faker.internet.avatar(),
    user: {
      databaseId: 1,
      login: lastCommitData.committer.name,
      url: faker.internet.url(),
    },
  },
};
const fileId = faker.git.commitSha();
const fileData = {
  name: 'changelog-guru',
  version: faker.system.semver(),
  description: 'Git changelog generator',
  homepage: 'https://github.com/keindev/changelog-guru#readme',
  license: 'MIT',
};

jest.spyOn(GQLCommit.prototype, 'getLastCommit').mockImplementation(() => Promise.resolve(lastCommitData));
jest.spyOn(GQLCommit.prototype, 'getList').mockImplementation(() => Promise.resolve([commitData]));
jest.spyOn(GQLFile.prototype, 'getId').mockImplementation(() => Promise.resolve(fileId));
jest.spyOn(GQLFile.prototype, 'getContent').mockImplementation(() => Promise.resolve(JSON.stringify(fileData)));

describe('GitHubProvider', () => {
  const provider = new GitHubProvider(faker.internet.url());

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
