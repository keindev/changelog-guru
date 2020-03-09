import { Arguments } from 'yargs';
import { TaskTree } from 'tasktree-cli';
import { Changelog, IOptions } from '../../Changelog';

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

export const handler = ({ bump, branch, provider, output }: Arguments<IBuildOptions>): Promise<void> => {
    const tree = TaskTree.tree().start();

    return new Changelog()
        .build({ bump, branch, provider, output })
        .then(() => tree.exit())
        .catch(TaskTree.fail);
};
