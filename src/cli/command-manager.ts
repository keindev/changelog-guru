import commandLineArgs from 'command-line-args';
import { TaskTree } from 'tasktree-cli';
import { Command } from './commands/command';
import { Help } from './help';

export class CommandManager {
    public static OPTION_SEPARATOR = ' ';

    private taskTree = TaskTree.tree();
    private commands: Command[];
    private command: Command | undefined;
    private argv: commandLineArgs.ParseOptions;
    private unknownOptions: string[];
    private readonly helpDefinition: commandLineArgs.OptionDefinition = { name: 'help', type: Boolean };

    public constructor(commands: Command[]) {
        const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true });

        // eslint-disable-next-line no-underscore-dangle
        this.unknownOptions = mainOptions._unknown || [];
        this.argv = { argv: this.unknownOptions };
        this.commands = commands;

        if (mainOptions.command) {
            this.command = commands.find((command): boolean => command.isMatched(mainOptions.command));

            if (!this.command) {
                this.error(mainOptions.command);
            } else if (!this.unknownOptions.length) {
                // TODO: `changelog build` can be called without parameters
                this.help(this.command);
                this.command = undefined;
            }
        } else if (this.unknownOptions.length) {
            this.error();
        } else {
            this.help();
        }
    }

    public async execute(): Promise<void> {
        if (this.command) {
            const command: Command = this.command as Command;

            try {
                const options = commandLineArgs([this.helpDefinition, ...command.getDefinitions()], this.argv);

                if (options.help) {
                    this.help(command);
                } else {
                    this.taskTree.start();

                    await command.execute(options);

                    this.taskTree.stop();
                }
            } catch {
                this.error();
            }
        }
    }

    private error(commandName: string = this.unknownOptions.join(CommandManager.OPTION_SEPARATOR)): void {
        process.stdout.write(`${Help.unexpectedCommand(commandName)}${Help.LINE_SEPARATOR}`);
    }

    private help(command?: Command): void {
        let output: string;

        if (command) {
            output = Help.command(command);
        } else {
            output = [
                Help.header('Changelog guru:'),
                Help.description('Git changelog generator, customizable a release changelog with helpful plugins'),
                ...this.commands.map(Help.command),
            ].join(Help.LINE_SEPARATOR);
        }

        process.stdout.write(`${output}${Help.LINE_SEPARATOR}`);
    }
}
