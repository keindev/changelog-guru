import faker from 'faker';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config';
import Author from '../../core/entities/Author';
import Commit from '../../core/entities/Commit';
import ScopeRenameRule from '../../core/rules/ScopeRenameRule';
import State from '../../core/State';

describe('Scope rename rule', () => {
  const config = new Config();

  beforeAll(async () => {
    await config.init();
  });

  it('Parse', () => {
    const author = new Author({ name: 'keindev', url: 'https://github.com/keindev', avatar: faker.internet.avatar() });
    const commitOptions = { hash: faker.git.commitSha(), timestamp: 0, url: faker.internet.url(), author };
    const context = new State('MIT');
    let commit = new Commit({ ...commitOptions, headline: 'feat(core, Jest 1, Jest 2): subject' });
    let rule = config.rules.find(item => item instanceof ScopeRenameRule) as ScopeRenameRule;

    rule.parse({ commit, context });

    expect(commit.accents).toStrictEqual(['Core', 'Jest 1', 'Jest 2']);

    rule = new ScopeRenameRule({ onlyPresented: true, names: { os: 'Open Source' } });
    commit = new Commit({ ...commitOptions, headline: 'feat(os, Jest 3, Jest 4): subject' });
    rule.parse({ commit, context });

    expect(commit.accents).toStrictEqual(['Open Source']);
  });

  it('Lint', () => {
    const task = new Task('Lint');
    const subject = faker.git.commitMessage();
    const options = { body: [], type: 'test', subject, task };
    const rule = new ScopeRenameRule({ onlyPresented: true, names: { core: 'Core', api: 'API' } });

    rule.lint({ ...options, headline: `test(core, api): ${subject}`, scope: 'core, api', task });

    expect(task.haveErrors).toBeFalsy();

    rule.lint({ ...options, headline: `test(abcd): ${subject}`, scope: 'abcd', task });

    expect(task.haveErrors).toBeTruthy();
  });
});
