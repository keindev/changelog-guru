import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import { IPluginConfig } from '../../plugins/Plugin';

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

export interface IConfigLoaderOptions {
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

    private data: IConfig = {};
    private options: IConfigLoaderOptions;

    public constructor(options: IConfigLoaderOptions = {}) {
        this.options = options;
    }

    async load(): Promise<Config> {
        const task = TaskTree.add('Reading configuration file...');
        const filePath = await this.loadConfig();
        let config: Config | undefined;

        if (filePath) {
            const { data, options } = this;

            config = new Config({
                provider: options.provider ?? data.provider ?? ServiceProvider.GitHub,
                filePath: options.output ?? this.data.output?.filePath ?? ConfigLoader.DEFAULT_OUTPUT_FILE_NAME,
                types: options.types && options.types.size ? options.types : this.getTypes(),
                exclusions: options.exclusions && options.exclusions.size ? options.exclusions : this.getExclusions(),
                plugins: this.getPlugins(),
            });

            task.complete(`Config file: {bold ${path.relative(process.cwd(), filePath)}}`);
        } else {
            task.fail('Default configuration file not found');
        }

        return config as Config;
    }

    private getTypes(): Map<string, ChangeLevel> {
        const types = new Map<string, ChangeLevel>();
        const { changes } = this.data;
        const levels = Object.values(ChangeLevel);

        if (changes) {
            Object.values(ChangeLevel).reduce((acc, level) => {
                if (Array.isArray(changes[level]))
                    acc.push(...changes[level].map((name): [string, ChangeLevel] => [name, level]));

                return acc;
            }, [] as [string, ChangeLevel][]);
        }

        Object.entries(changes).forEach(([level, names]) => {
            if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
            if (!levels.includes(level)) TaskTree.fail(`Unexpected level "${level}" of changes`);

            names.forEach(name => {
                types.set(name, level as ChangeLevel);
            });
        });

        return types;
    }

    private getExclusions(): Map<ExclusionType, string[]> {
        const exclusions: Map<ExclusionType, string[]> = new Map();
        const { output } = this.data;

        if (output?.exclude) {
            const types = Object.values(ExclusionType);

            Object.entries(output.exclude).forEach(([name, rules]) => {
                if (!types.includes(name)) TaskTree.fail('Unexpected exclusion name');

                exclusions.set(name, [...new Set(rules)]);
            });
        }

        return exclusions;
    }

    private getPlugins(): Map<string, IPluginConfig> {
        const activePlugins: Map<string, IPluginConfig> = new Map();
        const { plugins } = this.data;

        if (Array.isArray(plugins)) {
            plugins.forEach(plugin => {
                if (typeof plugin === 'string') {
                    activePlugins.set(plugin, {});
                } else {
                    Object.entries<IPluginConfig>(plugin).forEach(([name, config]) => {
                        if (config) {
                            activePlugins.set(
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

        return activePlugins;
    }

    private async loadConfig(): Promise<string | undefined> {
        const explorer = cosmiconfig(Config.MODULE_NAME);
        /*        const configs = await Promise.all([
            explorer.load(path.join(__dirname, Config.DEFAULT_CONFIG_PATH)),
            explorer.search(),
        ]).then(items => items.filter(item => item && item.isEmpty));

        this.data = configs[0] && configs.length === 2 ? deepmerge(configs[0]!, configs[1]!) : configs[0];
*/
        const defaultConfig = await explorer.load(path.join(__dirname, Config.DEFAULT_CONFIG_PATH));
        const externalConfig = await explorer.search();
        let filePath: string | undefined;

        if (defaultConfig && !defaultConfig.isEmpty) {
            if (externalConfig && !externalConfig.isEmpty) {
                this.data = deepmerge(defaultConfig.config, externalConfig.config);
                filePath = externalConfig.filepath;
            } else {
                this.data = defaultConfig.config;
                filePath = defaultConfig.filepath;
            }
        }

        return filePath;
    }
}
/*


export interface IConfigOptions {
    provider: ServiceProvider;
    filePath: string;
    types: Map<string, ChangeLevel>;
    exclusions: Map<ExclusionType, string[]>;
    plugins: Map<string, IPluginOption>;
}

export default class Config {
    readonly filePath: string;
    readonly provider: ServiceProvider;

    // FIXME: rename after update to TS 3.8
    private types: Map<string, ChangeLevel>;
    private plugins: Map<string, IPluginOption>;
    private exclusions: Map<ExclusionType, string[]>;

    constructor(options: IConfigOptions) {
        this.provider = options.provider;
        this.filePath = options.filePath;
        this.types = options.types;
        this.plugins = options.plugins;
        this.exclusions = options.exclusions;
    }

    get plugins(): [string, IPluginOption][] {
        return [...this.plugins.entries()];
    }

    get types(): [string, ChangeLevel][] {
        return [...this.types.entries()];
    }

    get exclusions(): [ExclusionType, string[]][] {
        return [...this.exclusions.entries()];
    }

    public getPlugin(name: string): IPluginOption | undefined {
        return this.plugins.get(name);
    }
}

*/
