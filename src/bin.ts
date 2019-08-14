import { TaskTree } from 'tasktree-cli';
import { ExitCode } from 'tasktree-cli/lib/enums';
import { CommandManager } from './cli/command-manager';
import { BuildCommand } from './cli/commands/build-command';
import { LintCommand } from './cli/commands/lint-command';

const manager = new CommandManager([new BuildCommand(), new LintCommand()]);
const taskTree = TaskTree.tree();

if (manager.isCorrectCommand()) {
    manager.execute().then(
        (): void => {
            taskTree.exit(ExitCode.Success);
        },
        (error): void => {
            TaskTree.fail(error);
        }
    );
} else {
    process.stdout.write(manager.help());
}
