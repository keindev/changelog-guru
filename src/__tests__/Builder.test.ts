// @see https://github.com/facebook/jest/issues/9430
import fs from 'fs';
import { Package } from 'package-json-helper';
import path from 'path';

// eslint-disable-next-line node/no-extraneous-import
import { jest } from '@jest/globals';

import Builder from '../core/Builder.js';
import { Config } from '../core/Config.js';
import Author from '../core/entities/Author.js';
import Commit from '../core/entities/Commit.js';
import GitHubProvider from '../core/providers/GitHubProvider.js';

jest.mock('../core/providers/GitHubProvider.ts');

const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
const hash = new Array(40).fill(0).join('').slice(0, -1);
const headlines = [
  'test(Builder): test commit',
  'feat: feat commit',
  'feat: feat commit',
  'feat: another feat commit',
  'perf(core): pref subject',
  'perf(core): pref subject',
  'build: ignored build commit',
];

describe('Builder', () => {
  let config: Config;

  beforeAll(() => {
    const author = new Author({
      login: 'keindev',
      url: 'https://github.com/keindev',
      avatar: 'https://avatars.githubusercontent.com/u/4527292',
    });
    const commits = headlines.map(
      (headline, index) =>
        new Commit({
          author,
          url: `https://github.com/keindev/changelog-guru/commit/${hash}${index}`,
          hash: `${hash}${index}`,
          headline,
          timestamp: new Date(new Date(0).getTime() + index * 1000).getTime(),
        })
    );

    config = new Config() as jest.Mocked<Config>;

    jest.spyOn(GitHubProvider.prototype, 'getLastChangeDate').mockImplementation(() => Promise.resolve(new Date(0)));
    jest.spyOn(GitHubProvider.prototype, 'getCommits').mockImplementation(() => Promise.resolve([...commits]));
    jest
      .spyOn(GitHubProvider.prototype, 'getPreviousPackage')
      .mockImplementation(() => Promise.resolve(new Package(pkg)));
    jest
      .spyOn(GitHubProvider.prototype, 'getCurrentPackage')
      .mockImplementation(() => Promise.resolve(new Package(pkg)));
    jest.spyOn(fs.promises, 'readFile').mockImplementation(filePath => {
      const basename = path.basename(filePath as string);
      let content = '';

      if (basename === 'package.json') content = JSON.stringify(pkg);
      if (basename === '.changelogrc.default.yml') {
        content = fs.readFileSync(path.resolve(process.cwd(), '.changelogrc.default.yml'), 'utf8');
      }

      return Promise.resolve(content);
    });
  });

  it('build', async () => {
    const builder = new Builder(config);
    const files: [string, string][] = [];

    jest.spyOn(fs.promises, 'writeFile').mockImplementation((name, data) => {
      files.push([path.relative(process.cwd(), name.toString()), data.toString()]);

      return Promise.resolve();
    });

    await builder.build();

    expect(files).toMatchSnapshot();
  });
});
