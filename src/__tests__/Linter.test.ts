import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../core/Config.js';
import { Linter } from '../core/Linter.js';

describe('Linter', () => {
  const config = new Config();
  const linter = new Linter(config, 100);

  describe('Lint commit messages', () => {
    it('Correct commit messages', async () => {
      const task = new Task('Lint');

      try {
        await linter.lint('test(core): some subject message 1');
        await linter.lint('test: some subject message 2');
        await linter.lint('improve: move to ESM\n!break');
      } finally {
        expect(task.haveErrors).toBeFalsy();
        task.complete();
      }
    });

    it('Incorrect commit messages', async () => {
      const results = [];

      try {
        await linter.lint('');
      } catch (error) {
        results.push(error);
      }

      try {
        await linter.lint('Test:');
      } catch (error) {
        results.push(error);
      }

      try {
        await linter.lint('wow: some subject message');
      } catch (error) {
        results.push(error);
      }

      expect(results).toStrictEqual(new Array(results.length).fill(new Error('Incorrect commit message:')));
    });
  });
});
