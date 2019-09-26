import { Arguments } from 'yargs';
import { TaskTree, ExitCode } from 'tasktree-cli';
import { Changelog } from '../../changelog';

export const command = 'lint';
export const alias = 'l';
export const desc = 'Lint commit message';
export const builder = {
    message: {
        required: true,
        type: 'string',
        description: 'Commit message for linting',
    },
    length: {
        required: false,
        type: 'number',
        description: 'Max commit header length',
    },
    lowercase: {
        required: false,
        type: 'boolean',
        description: 'Uses only lowercase types',
    },
};

export const handler = (argv: Arguments<{ [key: string]: any }>): Promise<void> => {
    const tree = TaskTree.tree();

    tree.start();

    const changelog = new Changelog();

    return changelog
        .lint(argv.message, {
            maxHeaderLength: argv.length,
            lowercaseTypesOnly: argv.lowercase,
        })
        .then(() => {
            tree.exit(ExitCode.Success);
        })
        .catch((error: string | Error) => {
            tree.fail(error);
        });
};
