import { CommandManager } from './cli/command-manager';
import { GenerateCommand } from './cli/commands/generate-command';
import { LintCommand } from './cli/commands/lint-command';

const manager = new CommandManager([new GenerateCommand(), new LintCommand()]);

if (manager.isCorrectCommand()) {
    manager.execute();
} else {
    // TODO: help
    // eslint-disable-next-line no-console
    console.log('Help');
}
