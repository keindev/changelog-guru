import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config.js';
import Author from '../../core/entities/Author.js';
import Commit from '../../core/entities/Commit.js';
import SectionGroupRule from '../../core/rules/SectionGroupRule.js';
import State from '../../core/State.js';

describe('Section group rule', () => {
  let config: Config;
  let context: State;
  let rule: SectionGroupRule;

  beforeAll(async () => {
    config = new Config();
    context = new State('MIT');
    await config.init();
    rule = config.rules.find(item => item instanceof SectionGroupRule) as SectionGroupRule;
  });

  it('Prepare', () => {
    expect(context.sections.length).toBe(0);

    rule.prepare({ context });

    expect(context.sections.length).toBe(7);
    expect(context.findSection('Features')).toBeDefined();
    expect(context.findSection('Improvements')).toBeDefined();
    expect(context.findSection('Bug Fixes')).toBeDefined();
    expect(context.findSection('Internal changes')).toBeDefined();
    expect(context.findSection('Performance Improvements')).toBeDefined();
    expect(context.findSection('Code Refactoring')).toBeDefined();
    expect(context.findSection('Reverts')).toBeDefined();
  });

  it('Parse', () => {
    const section = context.findSection('Bug Fixes');
    const author = new Author({
      login: 'keindev',
      url: 'https://github.com/keindev',
      avatar: 'https://avatars.githubusercontent.com/u/4527292?v=4',
    });
    const commit = new Commit({
      hash: '779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
      timestamp: 0,
      headline: 'fix: subject',
      url: 'https://github.com/keindev/changelog-guru/commit/779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
      author,
    });

    expect(section).toBeDefined();

    rule.parse({ commit, context });

    expect(section?.commits).toStrictEqual([commit]);
  });

  it('Lint', () => {
    const task = new Task('lint');
    const options = { headline: 'test(scope): subject', body: [], scope: 'scope', type: 'test', subject: 'subject' };

    rule.lint({ ...options, type: 'test', task });

    expect(task.haveErrors).toBeFalsy();

    rule.lint({ ...options, type: 'abcd', task });

    expect(task.haveErrors).toBeTruthy();
  });
});
