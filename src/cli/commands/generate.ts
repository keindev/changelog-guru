import { Arguments } from 'yargs';
import { TaskTree, ExitCode } from 'tasktree-cli';
import { ChangelogOptions, Changelog } from '../../changelog';

export const command = 'generate';
export const alias = 'g';
export const desc = 'Generate changelog';
export const builder = {
    bump: {
        required: false,
        type: 'boolean',
        description: 'Bumps package version in package.json if specified',
    },
    branch: {
        required: false,
        type: 'string',
        description: 'Sets the branch by which the change log will be generated',
    },
    provider: {
        required: false,
        type: 'string',
        description: 'Specifies the type of service provider to receive project information',
    },
    output: {
        required: false,
        type: 'string',
        description: 'File path to write change log to it',
    },
};

export const handler = (argv: Arguments<{ [key: string]: any }>): Promise<void> => {
    const tree = TaskTree.tree();
    const options: ChangelogOptions = {
        bump: argv.bump,
        branch: argv.branch,
        provider: argv.provider,
        filePath: argv.output,
    };

    tree.start();

    const changelog = new Changelog(options);

    return changelog
        .build()
        .then(() => {
            tree.exit(ExitCode.Success);
        })
        .catch((error: string | Error) => {
            tree.fail(error);
        });
};
