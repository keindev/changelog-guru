import { TaskTree } from 'tasktree-cli';
import { ExitCode } from 'tasktree-cli/lib/enums';
import { CommandManager } from './cli/command-manager';
import { BuildCommand } from './cli/commands/build-command';
import { LintCommand } from './cli/commands/lint-command';

const manager = new CommandManager([new BuildCommand(), new LintCommand()]);
const taskTree = TaskTree.tree();

manager
    .execute()
    .then((): void => {
        taskTree.exit(ExitCode.Success);
    })
    .catch((error): void => {
        taskTree.fail(error);
    });
