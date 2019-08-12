import { Task } from 'tasktree-cli/lib/task';
import { Commit } from './entities/commit';
import { PluginOption } from './config/config';
import { PluginLoader } from './plugins/plugin-loader';
import { State } from './state/state';
import { CommitPlugin } from './plugins/commit-plugin';
import Key from './utils/key';

export interface LinterOptions {
    lowercaseTypesOnly?: boolean;
    maxHeaderLength?: number;
}

export interface LintOptions {
    header: string;
    body: string[];
    type: string;
    scope: string;
    subject: string;
}

export default class Linter {
    public static DEFAULT_HEADER_MAX_LENGTH = 100;
    public static MIN_SUBJECT_LENGTH = 6;
    public static EMPTY_VALUE = '';

    private task: Task;
    private plugins: [string, PluginOption][];
    private types: string[];
    private maxHeaderLength: number;
    private lowercaseTypesOnly: boolean;
    private state: State = new State();
    private pluginLoader: PluginLoader = new PluginLoader();

    public constructor(plugins: [string, PluginOption][], types: string[], task: Task, options: LinterOptions) {
        this.plugins = plugins;
        this.types = types;
        this.task = task;
        this.maxHeaderLength = options.maxHeaderLength || Linter.DEFAULT_HEADER_MAX_LENGTH;
        this.lowercaseTypesOnly = !!options.lowercaseTypesOnly;
    }

    public async lint(message: string = Linter.EMPTY_VALUE): Promise<void> {
        const [header, body] = this.parseMessage(message);
        const [type, scope, subject] = this.parseHeader(header);

        await Promise.all(
            this.plugins.map(
                ([name, config]): Promise<void> =>
                    this.lintWithPlugin(name, config, {
                        header,
                        body,
                        type,
                        scope,
                        subject,
                    })
            )
        );
    }

    private parseMessage(message: string): [string, string[]] {
        let lines: string[] = [];
        let header = Linter.EMPTY_VALUE;

        if (message) {
            lines = message.split(Commit.LINE_SEPARATOR);
            header = lines.shift() as string;
        } else {
            this.task.error('Empty commit message');
        }

        return [header, lines];
    }

    private parseHeader(header: string): [string, string, string] {
        const [type, scope, subject] = Commit.splitHeader(header);
        const { task, maxHeaderLength } = this;
        const clearType = Key.unify(type);

        if (header.length > maxHeaderLength) task.error(`Header is longer than {bold ${maxHeaderLength}} characters`);

        if (type) {
            if (this.lowercaseTypesOnly && type !== clearType) task.error('Type is not in lowercase');
            if (!this.types.some((name): boolean => name === clearType)) task.error('Unknown commit type!');
        } else {
            task.error('Type is not defined or is not separated from the subject with "{bold :}"');
        }

        if (!subject) task.error('Subject is empty');
        if (subject.length < Linter.MIN_SUBJECT_LENGTH) task.error('Subject is not informative');

        return [clearType || Linter.EMPTY_VALUE, scope || Linter.EMPTY_VALUE, subject || Linter.EMPTY_VALUE];
    }

    private async lintWithPlugin(name: string, config: PluginOption, options: LintOptions): Promise<void> {
        const { task } = this;
        const plugin = await this.pluginLoader.load(task, { name, config, context: this.state });

        if (plugin instanceof CommitPlugin) {
            (plugin as CommitPlugin).lint(options, task);
        }
    }
}
