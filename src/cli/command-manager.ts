import commandLineArgs from 'command-line-args';
import { TaskTree } from 'tasktree-cli';
import { Command } from './commands/command';
import { Help } from './help';

export class CommandManager {
    private taskTree = TaskTree.tree();
    private commands: Command[];
    private command: Command | undefined;
    private argv: commandLineArgs.ParseOptions | undefined;
    private readonly helpDefinition: commandLineArgs.OptionDefinition = { name: 'help', type: Boolean };

    public constructor(commands: Command[]) {
        const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true });

        // eslint-disable-next-line no-underscore-dangle
        this.argv = { argv: mainOptions._unknown || [] };
        this.commands = commands;

        if (mainOptions.command) {
            this.command = commands.find((command): boolean => command.isMatched(mainOptions.command));
        } else {
            const { help } = commandLineArgs([this.helpDefinition], this.argv);

            if (help) {
                process.stdout.write(this.help());
            }
        }
    }

    public isCorrectCommand(): boolean {
        return !!this.command;
    }

    public async execute(): Promise<void> {
        if (this.isCorrectCommand()) {
            const command: Command = this.command as Command;
            const options = commandLineArgs([this.helpDefinition, ...command.getDefinitions()], this.argv);

            if (options.help) {
                process.stdout.write(this.help(command));
            } else {
                this.taskTree.start();

                await command.execute(options);

                this.taskTree.stop();
            }
        }
    }

    public help(command?: Command): string {
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

        return `${output}${Help.LINE_SEPARATOR}`;
    }
}
