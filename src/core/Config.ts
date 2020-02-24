import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';

export enum ServiceProvider {
    GitHub = 'github',
    GitLab = 'gitlab',
}

export enum ChangeLevel {
    Major = 'major',
    Minor = 'minor',
    Patch = 'patch',
}

export enum ExclusionType {
    AuthorLogin = 'authorLogin',
    CommitType = 'commitType',
    CommitScope = 'commitScope',
    CommitSubject = 'commitSubject',
}

export interface IConfigOptions {
    provider?: ServiceProvider;
    output?: string;
    types?: Map<string, ChangeLevel>;
    exclusions?: Map<ExclusionType, string[]>;
}

export interface IConfig extends cosmiconfig.Config {
    changes?: { [key in ChangeLevel]: string[] };
    output?: { filePath?: string; exclude?: { [key in ExclusionType]: string[] } };
    plugins?: { [key: string]: IPluginConfig };
}

export default class Config {
    static MODULE_NAME = 'changelog';
    static DEFAULT_CONFIG_PATH = `../../../.changelogrc.default.yml`;
    static DEFAULT_OUTPUT_FILE_NAME = 'CHANGELOG.md';

    private provider?: ServiceProvider;
    private filePath?: string;
    private types: Map<string, ChangeLevel>;
    private plugins = new Map<string, IPluginConfig>();
    private exclusions = new Map<ExclusionType, string[]>();

    constructor({ types, exclusions, output, provider }: IConfigOptions = {}) {
        this.types = types ?? new Map();
        this.exclusions = exclusions ?? new Map();
        this.filePath = output;
        this.provider = provider;
    }

    async load(): Promise<void> {
        const task = TaskTree.add('Reading configuration file...');
        const explorer = cosmiconfig(Config.MODULE_NAME);
        const conf = await explorer.load(path.join(__dirname, Config.DEFAULT_CONFIG_PATH));

        if (conf?.isEmpty !== false) task.fail('Default configuration file not found');

        const userConf = await explorer.search();
        const { provider, output, changes, plugins }: IConfig =
            userConf?.isEmpty === false ? deepmerge(conf!.config, userConf.config) : conf!.config;

        if (!this.provider) this.provider = provider ?? ServiceProvider.GitHub;
        if (!this.filePath) this.filePath = output?.filePath ?? Config.DEFAULT_OUTPUT_FILE_NAME;
        if (!this.types.size) this.setTypes(changes);
        if (!this.exclusions.size) this.setExclusions(output);

        this.setPlugins(plugins);
        task.complete(`Config file: {bold ${path.relative(process.cwd(), (conf?.filepath || userConf?.filepath)!)}}`);
    }

    private setTypes(changes: IConfig['changes']): void {
        if (changes) {
            const levels = Object.values(ChangeLevel);

            Object.entries(changes).forEach(([level, names]) => {
                if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
                if (!levels.includes(level)) TaskTree.fail(`Unexpected level "${level}" of changes`);

                names.forEach(name => {
                    this.types.set(name, level as ChangeLevel);
                });
            });
        }
    }

    private setExclusions(output: IConfig['output']): void {
        if (output?.exclude) {
            const types = Object.values(ExclusionType);

            Object.entries(output.exclude).forEach(([name, rules]) => {
                if (!types.includes(name)) TaskTree.fail('Unexpected exclusion name');

                this.exclusions.set(name, [...new Set(rules)]);
            });
        }
    }

    private setPlugins(plugins: IConfig['plugins']): void {
        if (Array.isArray(plugins)) {
            plugins.forEach(plugin => {
                if (typeof plugin === 'string') {
                    this.plugins.set(plugin, {});
                } else {
                    Object.entries<IPluginConfig>(plugin).forEach(([name, config]) => {
                        if (config) {
                            this.plugins.set(
                                name,
                                new Proxy(config, {
                                    get(target, fieldName, receiver): IPluginConfig {
                                        return Reflect.get(target, fieldName, receiver);
                                    },
                                    set(): boolean {
                                        return false;
                                    },
                                })
                            );
                        }
                    });
                }
            });
        }
    }
}
