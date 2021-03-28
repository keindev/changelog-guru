import fs from 'fs';
import readPkg from 'read-pkg';

import Builder from '../core/Builder';
import { Config } from '../core/Config';
import Author from '../core/entities/Author';
import Commit from '../core/entities/Commit';
import GitHubProvider from '../core/providers/GitHubProvider';

jest.mock('../core/providers/GitHubProvider.ts');

describe('Builder', () => {
  const hash = new Array(40).fill(0).join('').slice(0, -1);
  const url = `https://github.com/keindev/changelog-guru/commit/${hash}`;
  const headlines = [
    'test(Builder): test commit',
    'feat: feat commit',
    'feat: feat commit',
    'feat: another feat commit',
    'perf(core): pref subject',
    'perf(core): pref subject',
    'build: ignored build commit',
  ];
  const author = new Author({
    login: 'keindev',
    url: 'https://github.com/keindev',
    avatar: 'https://avatars.githubusercontent.com/u/4527292',
  });
  const commits = headlines.map(
    (headline, index) =>
      new Commit({
        author,
        url: `${url}${index}`,
        hash: `${hash}${index}`,
        headline,
        timestamp: new Date(new Date(0).getTime() + index * 1000).getTime(),
      })
  );

  beforeAll(() => {
    jest.spyOn(GitHubProvider.prototype, 'getLastChangeDate').mockImplementation(() => Promise.resolve(new Date(0)));
    jest.spyOn(GitHubProvider.prototype, 'getCommits').mockImplementation(() => Promise.resolve([...commits]));
    jest.spyOn(GitHubProvider.prototype, 'getPreviousPackage').mockImplementation(() => readPkg({ normalize: false }));
    jest.spyOn(GitHubProvider.prototype, 'getCurrentPackage').mockImplementation(() => readPkg({ normalize: false }));
  });

  it('build', async () => {
    const config = new Config() as jest.Mocked<Config>;
    const builder = new Builder(config);
    let output;

    jest.spyOn(fs.promises, 'writeFile').mockImplementation((_, data) => {
      output = data;

      return Promise.resolve();
    });

    await builder.build();

    expect(output).toMatchSnapshot();
  });
});
