import { CommandManager } from './cli/command-manager';
import { BuildCommand } from './cli/commands/build-command';
import { LintCommand } from './cli/commands/lint-command';

const manager = new CommandManager([new BuildCommand(), new LintCommand()]);

if (manager.isCorrectCommand()) {
    manager.execute();
} else {
    process.stdout.write(manager.help());
}
