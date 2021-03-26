import { TaskTree } from 'tasktree-cli';
import { Arguments } from 'yargs';

import Changelog, { IBuildOptions } from '../../Changelog';

export const command = 'generate';
export const alias = 'g';
export const desc = 'Generate changelog';
export const showInHelp = true;
export const builder = {
  bump: {
    boolean: true,
    description: 'Bumps package version in package.json if specified',
  },
  branch: {
    string: true,
    alias: 'b',
    description: 'Sets the branch by which the change log will be generated',
  },
  provider: {
    string: true,
    alias: 'p',
    description: 'Specifies the type of service provider to receive project information',
  },
  output: {
    string: true,
    alias: 'o',
    description: 'Output file path',
  },
};

const build = async (options: IBuildOptions): Promise<void> => {
  const tree = TaskTree.tree().start();
  const changelog = new Changelog();

  try {
    await changelog.build(options);
    tree.exit();
  } catch (error) {
    tree.fail(error);
  }
};

export const handler = (options: Arguments<IBuildOptions>): Promise<void> => build(options);
