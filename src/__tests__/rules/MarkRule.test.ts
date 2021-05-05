import faker from 'faker';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config';
import Author from '../../core/entities/Author';
import Commit, { CommitChangeType } from '../../core/entities/Commit';
import MarkRule from '../../core/rules/MarkRule';
import State from '../../core/State';

describe('Mark rule', () => {
  const config = new Config();
  const context = new State('MIT');
  const author = new Author({ login: 'keindev', url: 'https://github.com/keindev', avatar: faker.internet.avatar() });
  const commitOptions = { timestamp: 0, headline: 'feat(Jest): subject', url: faker.internet.url(), author };
  let rule: MarkRule;

  beforeAll(async () => {
    await config.init();

    rule = config.rules.find(item => item instanceof MarkRule) as MarkRule;
  });

  it('Prepare', () => {
    rule.prepare({ context });

    expect(context.sections.length).toBe(3);
    expect(context.findSection('Important Internal Changes')).toBeDefined();
    expect(context.findSection('DEPRECATIONS')).toBeDefined();
    expect(context.findSection('BREAKING CHANGES')).toBeDefined();
  });

  describe('Parse', () => {
    it('!deprecated marker', () => {
      const section = context.findSection('DEPRECATIONS');
      const commit = new Commit({ ...commitOptions, hash: faker.git.commitSha(), body: '!deprecated' });

      expect(section).toBeDefined();
      expect(commit.is(CommitChangeType.Deprecated)).toBeFalsy();

      rule.parse({ commit, context });

      expect(commit.is(CommitChangeType.Deprecated)).toBeTruthy();
      expect(section?.commits).toStrictEqual([commit]);
    });

    it('!break marker', () => {
      const section = context.findSection('BREAKING CHANGES');
      const commit = new Commit({ ...commitOptions, hash: faker.git.commitSha(), body: '!break' });

      expect(section).toBeDefined();
      expect(commit.is(CommitChangeType.BreakingChanges)).toBeFalsy();

      rule.parse({ commit, context });

      expect(commit.is(CommitChangeType.BreakingChanges)).toBeTruthy();
      expect(section?.commits).toStrictEqual([commit]);
    });

    it('!ignore marker', () => {
      const commit = new Commit({ ...commitOptions, hash: faker.git.commitSha(), body: '!ignore' });

      expect(commit.isIgnored).toBeFalsy();

      rule.parse({ commit, context });

      expect(commit.isIgnored).toBeTruthy();
    });

    it('!group marker', () => {
      const commit = new Commit({ ...commitOptions, hash: faker.git.commitSha(), body: '!group(Jest markers test)' });
      const count = context.sections.length;

      rule.parse({ commit, context });

      expect(context.sections.length).toBe(count + 1);
      expect(context.findSection('Jest markers test')).toBeDefined();
    });

    it('!important marker', () => {
      const section = context.findSection('Important Internal Changes');
      const commit = new Commit({ ...commitOptions, hash: faker.git.commitSha(), body: '!important' });

      expect(section).toBeDefined();
      expect(commit.is(CommitChangeType.Important)).toBeFalsy();

      rule.parse({ commit, context });

      expect(commit.is(CommitChangeType.Important)).toBeTruthy();
      expect(section?.commits).toStrictEqual([commit]);
    });
  });

  it('Lint', () => {
    const options = { headline: 'test(scope): subject', type: 'test', scope: 'scope', subject: 'subject' };
    let task = new Task('lint');

    rule.lint({ ...options, task, body: [''] });
    rule.lint({ ...options, task, body: ['!group(name)'] });
    rule.lint({ ...options, task, body: ['!important !deprecated !break !ignore'] });
    rule.lint({ ...options, task, body: ['!important !deprecated !break !ignore', ''] });
    rule.lint({ ...options, task, body: ['!important !deprecated !break !ignore', '', 'text'] });

    expect(task.haveErrors).toBeFalsy();

    rule.lint({ ...options, task, body: ['text'] });

    expect(task.haveErrors).toBeTruthy();

    task = new Task('lint');
    rule.lint({ ...options, task, body: ['!group'] });

    expect(task.haveErrors).toBeTruthy();
  });
});
