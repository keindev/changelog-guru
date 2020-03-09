import { Arguments } from 'yargs';
import { TaskTree } from 'tasktree-cli';
import { Changelog } from '../../Changelog';
import { ILintOptions } from '../../Linter';

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

export const handler = ({ message, maxLength }: Arguments<{ message: string } & ILintOptions>): Promise<void> => {
    const tree = TaskTree.tree().start();

    return new Changelog()
        .lint({ message, maxLength })
        .then(() => tree.exit())
        .catch(TaskTree.fail);
};
