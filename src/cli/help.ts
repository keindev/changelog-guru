import chalk from 'chalk';
import { Command } from './commands/command';

export class Help {
    public static OPTION_NAME_MAX_LENGTH = 50;
    public static LINE_SEPARATOR = '\n';
    public static INDENT = ' ';

    public static header(name: string): string {
        return chalk`{bold.underline ${name}}`;
    }

    public static description(text: string): string {
        return chalk`${Help.LINE_SEPARATOR} {dim ${text}}${Help.LINE_SEPARATOR}`;
    }

    public static command(command: Command): string {
        const name = command.alias ? `${command.alias}, ${command.name}` : command.name;
        const options = command.hasOptions() ? chalk` {dim [options]}` : '';
        const output = [chalk`${Help.LINE_SEPARATOR} {bold ${name}}${options} - ${command.description.toLowerCase()}`];

        command.getOptions().forEach(([option, description, type]): void => {
            output.push(
                `${chalk`    {bold --${option}} {dim ${type}}`.padEnd(
                    Help.OPTION_NAME_MAX_LENGTH,
                    Help.INDENT
                )}${description}`
            );
        });

        return output.join(Help.LINE_SEPARATOR);
    }
}
