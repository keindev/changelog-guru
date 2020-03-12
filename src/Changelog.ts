import fs from 'fs';
import readline from 'readline';
import path from 'path';
import dotenv from 'dotenv';
import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { once } from 'events';
import { TaskTree } from 'tasktree-cli';
import Reader from './core/io/Reader';
import Writer from './core/io/Writer';
import { ChangeLevel } from './core/entities/Entity';
import { splitHeader } from './core/entities/Commit';
import { unify, findSame } from './utils/Text';
import GitProvider, { ServiceProvider } from './core/providers/GitProvider';
import GitHubProvider from './core/providers/GitHubProvider';
import GitLabProvider from './core/providers/GitLabProvider';
import State, { ExclusionType } from './core/State';
import { IPlugin } from './plugins/Plugin';

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
    state: State;
    provider: GitProvider;
    filePath: string;
    types: [string, ChangeLevel][];
    exclusions: [ExclusionType, string[]][];
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
    #exclusions = Object.values(ExclusionType);
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
        if (!findSame(type, types.map(([name]) => name))) task.error('Unknown commit type!');
        if (!subject) task.error('Subject is empty');
        if (subject.length < 10)  task.error('Subject is not informative');

        task.log(`Header: {dim ${header || undefined}}`);
        plugins.forEach((plugin) => {
            if (plugin.lint) plugin.lint({ task, header, body, type, scope, subject });
        });

        if (task.haveErrors()) task.fail('Incorrect commit message:'); else task.complete('Commit message is correct');
    }

    private async getConfig(options?: IBuildOptions): Promise<IConfig> {
        const task = TaskTree.add('Reading configuration file...');
        const explorer = cosmiconfig('changelog');
        const baseConf = await explorer.load(path.join(__dirname, `../.changelogrc.default.yml`));
        const userConf = await explorer.search();

        if (baseConf?.isEmpty !== false) task.fail('Default configuration file not found');

        const config: {
            provider?: string;
            changes?: { [key in ChangeLevel]: string[] };
            output?: { filePath?: string; exclude?: { [key in ExclusionType]: string[] } };
            plugins?: { [key: string]: IPluginConfig };
        } = userConf?.isEmpty === false ? deepmerge(baseConf!.config, userConf.config) : baseConf!.config;
        const state = new State();
        const filePath = options?.output ?? config.output?.filePath ?? 'CHANGELOG.md';
        const provider = this.getProvider(config.provider ?? options?.provider ?? ServiceProvider.GitHub);
        const types = config.changes ? this.getTypes(config.changes) : [];
        const exclusions = config.output?.exclude ? this.getExclusions(config.output?.exclude) : [];
        const plugins = config.plugins ? this.getPlugins(config.plugins, state) : [];

        task.log(`Config file: {bold ${path.relative(process.cwd(), (baseConf?.filepath || userConf?.filepath)!)}}`);
        task.complete('Configuration initialized with:');

        return { state, filePath, provider, types, exclusions, plugins };
    }

    private getProvider(provider: ServiceProvider, branch?: string): GitProvider {
        if (!Object.values(ServiceProvider).includes(provider)) TaskTree.fail(`Service provider not supported`);

        return {
            [ServiceProvider.GitHub]: (r: string, b?: string): GitProvider => new GitHubProvider(r, b),
            [ServiceProvider.GitLab]: (r: string, b?: string): GitProvider => new GitLabProvider(r, b),
        }[provider](this.#package.repository, branch)!
    }

    private getTypes(changes: { [key in ChangeLevel]: string[] }): IConfig['types'] {
        return Object.entries(changes).reduce((acc, [level, names]) => {
            if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
            if (!this.#levels.includes(level as ChangeLevel)) TaskTree.fail(`Unexpected level "${level}" of changes`);

            names.forEach((name) => acc.push([name, level as ChangeLevel]));

            return acc;
        }, [] as IConfig['types']);
    }

    private getExclusions(exclusions: { [key in ExclusionType]: string[] }): IConfig['exclusions'] {
        return Object.entries(exclusions).map(([name, rules]) => {
            if (!this.#exclusions.includes(name as ExclusionType)) TaskTree.fail('Unexpected exclusion name');

            return [name as ExclusionType, [...(new Set(rules))]];
        })
    }

    private getPlugins(plugins: { [key: string]: IPluginConfig }, state: State): IConfig['plugins'] {
        return [...Object.entries<IPluginConfig>(plugins)].map(([name, configuration]) => {
            if (!this.#plugins.has(name)) TaskTree.fail(`Unknown plugin {bold ${name}}`);

            return new (this.#plugins.get(name)!)(configuration, state);
        });
    }
}
