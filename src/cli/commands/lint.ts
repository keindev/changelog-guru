import { Arguments } from 'yargs';
import { TaskTree, ExitCode } from 'tasktree-cli';
import { Changelog } from '../../changelog';

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
    length: {
        number: true,
        alias: 'l',
        description: 'Max commit header length',
    },
    lowercase: {
        boolean: true,
        description: 'Uses only lowercase types',
    },
};

interface LintOptions {
    message: string;
    length: number;
    lowercase: boolean;
}

export const handler = (argv: Arguments<LintOptions>): Promise<void> => {
    const tree = TaskTree.tree().start();
    const changelog = new Changelog();

    return changelog
        .lint(argv.message, { maxHeaderLength: argv.length, lowercaseTypesOnly: argv.lowercase })
        .then(() => tree.exit(ExitCode.Success))
        .catch(TaskTree.fail);
};
