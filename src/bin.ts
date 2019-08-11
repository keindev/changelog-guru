import { CommandManager } from './commands/command-manager';
import { GenerateCommand } from './commands/generate-command';
import { LintCommand } from './commands/lint-command';

const manager = new CommandManager([new GenerateCommand(), new LintCommand()]);

if (manager.isCorrectCommand()) {
    manager.execute();
} else {
    // TODO: help
    // eslint-disable-next-line no-console
    console.log('Help');
}
