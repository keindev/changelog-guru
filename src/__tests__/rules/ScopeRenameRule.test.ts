import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config.js';
import Author from '../../core/entities/Author.js';
import Commit from '../../core/entities/Commit.js';
import ScopeRenameRule from '../../core/rules/ScopeRenameRule.js';
import State from '../../core/State.js';

describe('Scope rename rule', () => {
  let config: Config;

  beforeAll(async () => {
    config = new Config();
    await config.init();
  });

  it('Parse', () => {
    const author = new Author({
      login: 'keindev',
      url: 'https://github.com/keindev',
      avatar: 'https://avatars.githubusercontent.com/u/4527292?v=4',
    });
    const commitOptions = {
      hash: '779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
      timestamp: 0,
      url: 'https://github.com/keindev/changelog-guru/commit/779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
      author,
    };
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
    const subject = 'Commit message subject';
    const options = { body: [], type: 'test', subject, task };
    const rule = new ScopeRenameRule({ onlyPresented: true, names: { core: 'Core', api: 'API' } });

    rule.lint({ ...options, headline: `test(core, api): ${subject}`, scope: 'core, api', task });

    expect(task.haveErrors).toBeFalsy();

    rule.lint({ ...options, headline: `test(abcd): ${subject}`, scope: 'abcd', task });

    expect(task.haveErrors).toBeTruthy();
  });
});
