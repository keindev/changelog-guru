import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { once } from 'events';
import { Task } from 'tasktree-cli/lib/Task';
import { splitHeader } from './core/entities/Commit';
import PluginLoader from './plugins/PluginLoader';
import { unify, findSame } from './utils/Text';
import { IPluginConfig } from './plugins/Plugin';

export interface ILintOptions {
    maxLength?: number;
}

export interface ILinterOptions {
    task: Task,
    config: ILintOptions;
    plugins: [string, IPluginConfig][];
    types: string[];
}

export class Linter {
    #task: Task;
    #plugins: [string, IPluginConfig][];
    #types: string[];
    #maxLength: number;

    constructor({ task, plugins, types, config }: ILinterOptions) {
        this.#task = task;
        this.#plugins = plugins;
        this.#types = types;
        this.#maxLength = config.maxLength || 100;
    }

    async lint(value: string): Promise<void> {
        const message = await this.read(value);
        const body = message.split('\n');
        const header = body.shift() as string;
        const [type, scope, subject] = splitHeader(header);

        if (!message) this.#task.error('Empty commit message');
        if (header.length > this.#maxLength) this.#task.error(`Header is longer than {bold ${this.#maxLength}}`);
        if (!type) this.#task.error('Type is not defined or is not separated from the subject with "{bold :}"');
        if (type !== unify(type)) this.#task.error('Type is not in lowercase');
        if (!findSame(type, this.#types)) this.#task.error('Unknown commit type!');
        if (!subject) this.#task.error('Subject is empty');
        if (subject.length < 10)  this.#task.error('Subject is not informative');

        this.#task.log(`Header: {dim ${header || undefined}}`);

        const loader = new PluginLoader();

        await Promise.all(this.#plugins.map(([name, config]) => loader.getPlugin(name, config))).then(plugins => {
            plugins.forEach((plugin) => {
                if (plugin?.lint) plugin.lint({ header, body, type, scope, subject }, this.#task);
            })
        });
    }

    private async read(str: string): Promise<string> {
        // The recommended method to specify -m with husky was `changelog lint -m $HUSKY_GIT_PARAMS`
        // This does not work properly with win32 systems, where env variable declarations use a different syntax
        const parameter = ['HUSKY_GIT_PARAMS', 'GIT_PARAMS'].find(n => [str, `%${n}%`, `$${n}`].includes(n));
        let filePath: string | undefined;

        if (parameter && parameter in process.env) filePath = process.env[parameter];
        if (str === '.git/COMMIT_EDITMSG') filePath = path.resolve(process.cwd(), str);
        if (!filePath) return str;
        if (!fs.existsSync(filePath)) this.#task.fail(`${filePath} not found`);

        const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
        const lines: string[] = [];

        rl.on('line', line => {
            if (line.trim()[0] !== '#') lines.push(line);
        });

        await once(rl, 'close');

        return lines.join('\n');
    }
}
