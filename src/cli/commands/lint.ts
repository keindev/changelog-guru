import { Arguments } from 'yargs';
import { TaskTree, ExitCode } from 'tasktree-cli';
import { Changelog } from '../../Changelog';

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

interface ILintOptions {
    message: string;
    length: number;
    lowercase: boolean;
}

export const handler = ({ message, maxLength }: Arguments<ILintOptions>): Promise<void> => {
    const tree = TaskTree.tree().start();
    const changelog = new Changelog();

    return changelog
        .lint(message, { maxLength })
        .then(() => tree.exit(ExitCode.Success))
        .catch(TaskTree.fail);
};
