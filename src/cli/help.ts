import chalk from 'chalk';
import { Command, CommandType } from './commands/command';

export class Help {
    public static COMMAND_NAME_MAX_LENGTH = 32;
    public static OPTION_NAME_MAX_LENGTH = 50;

    public static LINE_SEPARATOR = '\n';
    public static EMPTY_SEPARATOR = '';
    public static INDENT = '  ';

    public static header(name: string): string {
        return chalk`{bold.underline ${name}}`;
    }

    public static description(text: string): string {
        const description = chalk` {dim ${text}}`;

        return [Help.EMPTY_SEPARATOR, description, Help.EMPTY_SEPARATOR].join(Help.LINE_SEPARATOR);
    }

    public static command(command: Command): string {
        const name = command.alias ? `${command.alias}, ${command.name}` : command.name;
        const options = command.hasOptions() ? chalk` {dim [options]}` : '';

        return [
            chalk` {bold ${name}}${options}`.padEnd(Help.COMMAND_NAME_MAX_LENGTH, Help.INDENT),
            command.description.toLowerCase(),
        ].join(Help.EMPTY_SEPARATOR);
    }

    public static option(name: string, description: string, type: CommandType): string {
        return [
            chalk`    {bold --${name}} {dim ${type}}`.padEnd(Help.OPTION_NAME_MAX_LENGTH, Help.INDENT),
            description,
        ].join(Help.EMPTY_SEPARATOR);
    }
}
