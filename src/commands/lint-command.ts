import { CommandLineOptions } from 'command-line-args';
import { Command } from './command';
import { Changelog } from '../changelog';

export class LintCommand extends Command {
    public constructor() {
        super('lint', 'l', 'Lint commit message');

        this.setDefaultOption('message', 'lint message');
    }

    public async execute(options: CommandLineOptions): Promise<void> {
        const changelog = new Changelog(this.changelogOptions);

        await changelog.lint(options.message);
    }
}
