import fs from 'fs';
import readline from 'readline';
import path from 'path';
import dotenv from 'dotenv';
import { TaskTree } from 'tasktree-cli';
import Reader from './core/io/Reader';
import Writer from './core/io/Writer';
import Config, { ServiceProvider } from './core/config/Config';
import Package from './core/package/Package';
import ConfigLoader, { IConfigLoaderOptions } from './core/config/ConfigLoader';
import State from './core/state/State';
import Provider from './core/providers/Provider';
import GitHubProvider from './core/providers/GitHubProvider';
import { cosmiconfig } from 'cosmiconfig';
import { ChangeLevel } from './core/entities/Entity';
import { ExclusionType } from './core/State';
import { IPluginConfig, IPlugin } from './plugins/Plugin';
import deepmerge from 'deepmerge';
import { once } from 'events';
import { Task } from 'tasktree-cli/lib/Task';
import { splitHeader } from './core/entities/Commit';
import PluginLoader from './plugins/PluginLoader';
import { unify, findSame } from './utils/Text';
import { IPluginConfig } from './plugins/Plugin';
import { Provider } from 'gh-gql';
import GitProvider from './core/providers/GitProvider';
import { IPluginContext, IPlugin, IPluginConfig } from './plugins/Plugin';

export interface IBuildOptions {
    bump?: boolean;
    branch?: string;
    provider?: ServiceProvider;
    output?: string;
}

export interface ILintOptions {
    message?: string;
    maxLength?: number;
}

interface IConfig {
    provider: Provider;
    filePath: string;
    types: Map<string, ChangeLevel>;
    exclusions: [ExclusionType, string[]];
    plugins: IPlugin[];
}

/*

#bump = false
#branch = 'master'
#provider = ServiceProvider.GitHub;
#output = 'CHANGELOG.md';

*/

export class Changelog {
    #package = new Package();
    #types = Object.values(ExclusionType);
    #levels = Object.values(ChangeLevel);
    #plugins = new Map<string, { new (context: IPluginContext): IPlugin }>([
        ['package-changes', PackageChangesInformer],
        ['highlights', Highlighter],
        ['markers', MarkersManager],
        ['scopes', ScopeLinker],
        ['sections', SectionLinker],
    ]);

    constructor() {
        dotenv.config();
    }

    async build({ bump, ...options }: IBuildOptions): Promise<void> {
        const { provider, types, exclusions, plugins } = await this.getConfig(options);
        const reader = new Reader(provider);
        const state = await reader.read(this.#package);

        state.updateCommitsChangeLevel(types);
        state.ignoreEntities(exclusions);
        await state.modify(plugins);
        await new Writer().write(state.getSections(), state.getAuthors());

        if (bump) await this.#package.bump(...state.changesLevels);
    }

    async lint({ message = '', maxLength = 100 }: ILintOptions): Promise<void> | never {
        const { types, plugins } = await this.getConfig();
        const task = TaskTree.add('Lint commit message:');
        // The recommended method to specify -m with husky was `changelog lint -m $HUSKY_GIT_PARAMS`
        // This does not work properly with win32 systems, where env variable declarations use a different syntax
        const parameter = ['HUSKY_GIT_PARAMS', 'GIT_PARAMS'].find(n => [message, `%${n}%`, `$${n}`].includes(n));
        const body: string[] = [];
        let filePath: string | undefined;

        if (!message) task.error('Empty commit message');
        if (parameter && parameter in process.env) filePath = process.env[parameter];
        if (message === '.git/COMMIT_EDITMSG') filePath = path.resolve(process.cwd(), message);
        if (filePath) {
            if (!fs.existsSync(filePath)) task.fail(`${filePath} not found`);

            const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });

            rl.on('line', line => {
                if (line.trim()[0] !== '#') body.push(line);
            });

            await once(rl, 'close');
        } else {
            body.push(...message!.split('\n'));
        }

        const header = body.shift() as string;
        const [type, scope, subject] = splitHeader(header);

        if (header.length > maxLength) task.error(`Header is longer than {bold ${maxLength}}`);
        if (!type) task.error('Type is not defined or is not separated from the subject with "{bold :}"');
        if (type !== unify(type)) task.error('Type is not in lowercase');
        if (!findSame(type, [...types.keys()])) task.error('Unknown commit type!');
        if (!subject) task.error('Subject is empty');
        if (subject.length < 10)  task.error('Subject is not informative');

        task.log(`Header: {dim ${header || undefined}}`);
        await Promise.all([...plugins.entries()].map(([name, config]) => loader.getPlugin(name, config))).then(plugins => {
            plugins.forEach((plugin) => {
                if (plugin?.lint) plugin.lint({ header, body, type, scope, subject }, task);
            })
        });

        if (task.haveErrors()) task.fail('Incorrect commit message:'); else task.complete('Commit message is correct');
    }

    private async getConfig(options?: IBuildOptions): Promise<IConfig> {
        const task = TaskTree.add('Reading configuration file...');
        const explorer = cosmiconfig('changelog');
        const baseConf = await explorer.load(path.join(__dirname, `../.changelogrc.default.yml`));
        const userConf = await explorer.search();

        if (baseConf?.isEmpty !== false) task.fail('Default configuration file not found');

        const { provider = options?.provider ?? ServiceProvider.GitHub, output, changes, plugins }: {
            provider?: string;
            changes?: { [key in ChangeLevel]: string[] };
            output?: { filePath?: string; exclude?: { [key in ExclusionType]: string[] } };
            plugins?: { [key: string]: IPluginConfig };
        } = userConf?.isEmpty === false ? deepmerge(baseConf!.config, userConf.config) : baseConf!.config;

        if (!Object.values(ServiceProvider).includes(provider)) task.fail(`Service provider not supported`);

        const config: IConfig = {
            filePath: options?.output ?? output?.filePath ?? 'CHANGELOG.md',
            provider: {
                [ServiceProvider.GitHub]: (r: string, b?: string): GitProvider => new GitHubProvider(r, b),
                [ServiceProvider.GitLab]: (r: string, b?: string): GitProvider => new GitLabProvider(r, b),
            }[provider as ServiceProvider](this.#package.repository, options?.branch)!,
            types: Object.entries(changes).map(([level, names]) => {
                if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
                if (!levels.includes(level as ChangeLevel)) TaskTree.fail(`Unexpected level "${level}" of changes`);

                return [name, level as ChangeLevel]
            }),
            exclusions: Object.entries(output?.exclude ?? {}).map(([name, rules]) => {
                if (!types.includes(name as ExclusionType)) TaskTree.fail('Unexpected exclusion name');

                return [name as ExclusionType, [...new Set(rules)]];
            }),
            plugins: [...Object.entries<IPluginConfig>(plugins)].map(([name, config]) => {
                if (!this.#plugins.has(name)) task.fail('Unknown plugin name');

                return new (this.#plugins.get(name)!)(ctx, config);
            })
        }

        task.log(`Config file: {bold ${path.relative(process.cwd(), (baseConf?.filepath || userConf?.filepath)!)}}`);
        task.complete('Configuration initialized with:');

        return config;
    }
}
