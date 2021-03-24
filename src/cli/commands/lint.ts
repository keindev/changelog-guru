import { TaskTree } from 'tasktree-cli';
import { Arguments } from 'yargs';

import Changelog, { ILintOptions } from '../../Changelog';

export const command = 'lint';
export const alias = 'l';
export const desc = 'Lint commit message';
export const showInHelp = true;
export const builder = {
  message: {
    required: true,
    string: true,
    alias: 'm',
    description: 'Commit message for linting',
  },
  maxLength: {
    number: true,
    alias: 'l',
    description: 'Max commit header length',
  },
};

const lint = async (options: ILintOptions): Promise<void> => {
  const tree = TaskTree.tree().start();
  const changelog = new Changelog();

  try {
    await changelog.lint(options);
    tree.exit();
  } catch (error) {
    tree.fail(error);
  }
};

export const handler = (options: Arguments<ILintOptions>): Promise<void> => lint(options);
