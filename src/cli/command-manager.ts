import chalk from 'chalk';
import commandLineArgs from 'command-line-args';
import { TaskTree } from 'tasktree-cli';
import { Command } from './commands/command';

export class CommandManager {
    public static OPTION_NAME_MAX_LENGTH = 50;
    public static LINE_SEPARATOR = '\n';
    public static INDENT = ' ';

    private taskTree = TaskTree.tree();
    private commandName: string | undefined;
    private command: Command | undefined;
    private commands: Command[];
    private hasHelpOption: boolean;
    private argv: commandLineArgs.ParseOptions;
    private readonly helpDefinition: commandLineArgs.OptionDefinition = { name: 'help', type: Boolean };

    public constructor(commands: Command[]) {
        const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }, this.helpDefinition], {
            stopAtFirstUnknown: true,
        });

        // eslint-disable-next-line no-underscore-dangle
        this.argv = { argv: mainOptions._unknown || [] };
        this.hasHelpOption = mainOptions.help;
        this.commandName = mainOptions.command;
        this.command = commands.find((command): boolean => command.isMatched(mainOptions.command));
        this.commands = commands;
    }

    private static print(lines: string | string[]): void {
        const text = Array.isArray(lines) ? lines.join(CommandManager.INDENT) : lines;

        process.stdout.write(`${text}${CommandManager.LINE_SEPARATOR}`);
    }

    private static renderCommandHelp(command: Command): string {
        const name = command.alias ? `${command.alias}, ${command.name}` : command.name;
        const options = command.hasOptions() ? chalk` {dim [options]}` : '';
        const output = [
            chalk`${CommandManager.LINE_SEPARATOR} {bold ${name}}${options} - ${command.description.toLowerCase()}`,
        ];

        command.getOptions().forEach(([option, description, type]): void => {
            output.push(
                `${chalk`    {bold --${option}} {dim ${type}}`.padEnd(
                    CommandManager.OPTION_NAME_MAX_LENGTH,
                    CommandManager.INDENT
                )}${description}`
            );
        });

        return output.join(CommandManager.LINE_SEPARATOR);
    }

    public async execute(): Promise<void> {
        const { command, commandName } = this;

        if (this.hasHelpOption || !commandName) {
            this.printHelp();
        } else if (!command) {
            CommandManager.print([
                chalk`changelog «{bold ${commandName}}» is not a changelog command.`,
                chalk`See {bold «changelog --help»}.`,
            ]);
        } else {
            try {
                const options = commandLineArgs(command.getDefinitions(), this.argv);

                this.taskTree.start();
                await command.execute(options);
                this.taskTree.stop();
            } catch (error) {
                const { argv } = this.argv;

                if (Array.isArray(argv) && argv.length) {
                    CommandManager.print([
                        chalk`command «{bold ${commandName}}» doesn't have option {dim ${argv.pop() as string}}.`,
                        chalk`See {bold «changelog ${commandName} --help»}.`,
                    ]);
                } else {
                    throw error;
                }
            }
        }
    }

    private printHelp(): void {
        const { command } = this;
        let output: string;

        if (command) {
            output = CommandManager.renderCommandHelp(command);
        } else {
            output = [
                chalk`{bold.underline Changelog guru:}`,
                chalk` {dim Git changelog generator, customizable a release changelog with helpful plugins}`,
                ...this.commands.map(CommandManager.renderCommandHelp),
            ].join(CommandManager.LINE_SEPARATOR);
        }

        CommandManager.print(output);
    }
}
