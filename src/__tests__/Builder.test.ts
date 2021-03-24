import faker from 'faker';
import readPkg from 'read-pkg';

import Builder from '../core/Builder';
import { Config } from '../core/Config';
import Author from '../core/entities/Author';
import Commit from '../core/entities/Commit';
import GitHubProvider from '../core/providers/GitHubProvider';

jest.mock('../core/providers/GitHubProvider.ts');

describe('Builder', () => {
  const date = new Date();
  const url = faker.internet.url();
  const pkg = readPkg.sync({ normalize: false });
  const author = new Author({ name: faker.internet.userName(), url, avatar: faker.internet.avatar() });
  const commits = [
    new Commit({ author, url, hash: faker.git.commitSha(), headline: 'test: subject 1', timestamp: 0 }),
    new Commit({ author, url, hash: faker.git.commitSha(), headline: 'test: subject 2', timestamp: 1 }),
  ];

  beforeAll(() => {
    jest.spyOn(GitHubProvider.prototype, 'getLastChangeDate').mockImplementation(() => Promise.resolve(date));
    jest.spyOn(GitHubProvider.prototype, 'getCommits').mockImplementation(() => Promise.resolve([...commits]));
    jest.spyOn(GitHubProvider.prototype, 'getPrevPackage').mockImplementation(() => Promise.resolve(pkg));
  });

  it('build', async () => {
    const config = new Config() as jest.Mocked<Config>;
    const builder = new Builder(config);
    let data;

    jest.mock('fs', () => ({
      promises: {
        writeFile: jest.fn().mockResolvedValue((str: string) => {
          data = str;

          return Promise.resolve();
        }),
      },
    }));

    await builder.build();

    expect(data).toStrictEqual('111');
  });
});
