import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../core/Config';
import { Linter } from '../core/Linter';

describe('Linter', () => {
  const config = new Config();
  const linter = new Linter(config, 100);
  let task: Task;

  beforeAll(async () => {
    await config.init();
  });

  beforeEach(() => {
    task = new Task('Lint');
  });

  describe('Lint commit messages', () => {
    it('Correct commit messages', async () => {
      await linter.lint('test(core): some subject message 1');
      await linter.lint('test: some subject message 2');

      expect(task.haveErrors).toBeFalsy();
    });

    it('Incorrect commit messages', async () => {
      await linter.lint('');
      await linter.lint('Test:');
      await linter.lint('wow: some subject message');

      expect(task.haveErrors).toBeTruthy();
    });
  });
});
