import commandLineArgs from 'command-line-args';
import { TaskTree } from 'tasktree-cli';
import { Command } from './command';

export class CommandManager {
    private taskTree = TaskTree.tree();
    private command: Command | undefined;
    private argv: commandLineArgs.ParseOptions;

    public constructor(commands: Command[]) {
        const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true });

        this.command = commands.find((command): boolean => command.name === mainOptions.command);
        // eslint-disable-next-line no-underscore-dangle
        this.argv = { argv: mainOptions._unknown || [] };
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
}
