import faker from 'faker';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config';
import Author from '../../core/entities/Author';
import Commit from '../../core/entities/Commit';
import SectionGroupRule from '../../core/rules/SectionGroupRule';
import State from '../../core/State';

describe('Section group rule', () => {
  const config = new Config();
  const context = new State('MIT');
  let rule: SectionGroupRule;

  beforeAll(async () => {
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
    const author = new Author({ login: 'keindev', url: 'https://github.com/keindev', avatar: faker.internet.avatar() });
    const commit = new Commit({
      hash: faker.git.commitSha(),
      timestamp: 0,
      headline: 'fix: subject',
      url: faker.internet.url(),
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
