import { Arguments } from 'yargs';
import { TaskTree, ExitCode } from 'tasktree-cli';
import { Changelog } from '../../Changelog';
import { ServiceProvider } from '../../core/config/Config';

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
        description: 'File path to write change log to it',
    },
};

interface IGenerateOptions {
    bump: boolean;
    branch: string;
    provider: ServiceProvider;
    output: string;
}

export const handler = (argv: Arguments<IGenerateOptions>): Promise<void> => {
    const tree = TaskTree.tree().start();
    const changelog = new Changelog({
        bump: argv.bump,
        branch: argv.branch,
        provider: argv.provider,
        filePath: argv.output,
    });

    return changelog
        .build()
        .then(() => tree.exit(ExitCode.Success))
        .catch(TaskTree.fail);
};
