import { CommandLineOptions } from 'command-line-args';
import { Command, CommandType } from './command';
import { Changelog } from '../../changelog';

export class LintCommand extends Command {
    public constructor() {
        super('lint', 'l', 'Lint commit message');

        this.setOption('message', 'Commit message for linting');
        this.setOption('length', 'Max commit header length', CommandType.Number);
        this.setOption('lowercase-only', 'Uses only lowercase types', CommandType.Boolean);
    }

    public async execute(options: CommandLineOptions): Promise<void> {
        const changelog = new Changelog(this.changelogOptions);

        await changelog.lint(options.message, {
            maxHeaderLength: options.length,
            lowercaseTypesOnly: options['lowercase-only'],
        });
    }
}
