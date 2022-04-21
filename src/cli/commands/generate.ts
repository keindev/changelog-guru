import TaskTree from 'tasktree-cli';
import { Arguments } from 'yargs';

import Changelog, { IBuildOptions } from '../../Changelog.js';

const generate = async (options: IBuildOptions): Promise<void> => {
  const tree = TaskTree.tree().start();
  const changelog = new Changelog();

  try {
    await changelog.generate(options);
    tree.exit();
  } catch (error) {
    tree.fail(error);
  }
};

export default {
  command: 'generate',
  alias: 'g',
  desc: 'Generate changelog',
  showInHelp: true,
  builder: {
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
  },
  handler: (options: Arguments<IBuildOptions>): Promise<void> => generate(options),
};
