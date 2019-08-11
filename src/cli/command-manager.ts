import commandLineArgs from 'command-line-args';
import { TaskTree } from 'tasktree-cli';
import { Command } from './commands/command';
import { Help } from './help';

export class CommandManager {
    private taskTree = TaskTree.tree();
    private commands: Command[];
    private command: Command | undefined;
    private argv: commandLineArgs.ParseOptions | undefined;

    public constructor(commands: Command[]) {
        const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true });

        if (mainOptions.command) {
            this.command = commands.find((command): boolean => command.isMatched(mainOptions.command));
            // eslint-disable-next-line no-underscore-dangle
            this.argv = { argv: mainOptions._unknown || [] };
        }

        this.commands = commands;
    }

    public isCorrectCommand(): boolean {
        return !!this.command;
    }

    public async execute(): Promise<void> {
        if (this.isCorrectCommand()) {
            const command: Command = this.command as Command;
            const options = commandLineArgs(command.getDefinitions(), this.argv);

            this.taskTree.start();

            await command.execute(options);

            this.taskTree.stop();
        }
    }

    public help(): string {
        const output: string[] = [
            Help.header('Changelog guru:'),
            Help.description('Git changelog generator, customizable a release changelog with helpful plugins'),
        ];

        this.commands.forEach((command): void => {
            output.push(Help.command(command));

            command.getOptions().forEach(([name, description, type]): void => {
                output.push(Help.option(name, description, type));
            });

            output.push(Help.LINE_SEPARATOR);
        });

        return output.join(Help.LINE_SEPARATOR);
    }
}
