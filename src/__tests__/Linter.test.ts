import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../core/Config';
import { Linter } from '../core/Linter';

describe('Linter', () => {
  const config = new Config();
  const linter = new Linter(config, 100);

  beforeAll(async () => {
    await config.init();
  });

  describe('Lint commit messages', () => {
    it('Correct commit messages', async () => {
      const task = new Task('Lint');

      try {
        await linter.lint('test(core): some subject message 1');
        await linter.lint('test: some subject message 2');
      } finally {
        expect(task.haveErrors).toBeFalsy();
      }
    });

    it('Incorrect commit messages', async () => {
      const messages = ['', 'Test:', 'wow: some subject message'];
      const results = await Promise.allSettled(messages.map(message => linter.lint(message)));

      expect(results).toStrictEqual(
        new Array(messages.length).fill({
          reason: new Error('Incorrect commit message:'),
          status: 'rejected',
        })
      );
    });
  });
});
