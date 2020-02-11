import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import Config, { ServiceProvider, ChangeLevel, ExclusionType } from './Config';

export interface IConfigLoaderOptions {
    provider?: ServiceProvider;
    output?: string;
    types?: Map<string, ChangeLevel>;
    exclusions?: Map<ExclusionType, string[]>;
}

export default class ConfigLoader {
    static MODULE_NAME = 'changelog';
    static DEFAULT_CONFIG_PATH = `../../../.changelogrc.default.yml`;
    static DEFAULT_OUTPUT_FILE_NAME = 'CHANGELOG.md';

    private filePath = path.join(__dirname, ConfigLoader.DEFAULT_CONFIG_PATH);
    private data: cosmiconfig.Config = {};
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

        if (changes) {
            const levels = Object.values<string>(ChangeLevel);

            Object.entries(changes).reduce((acc, [level, names]): [string, ChangeLevel][] => {
                if (levels.includes(level)) TaskTree.fail('Unexpected level of changes');

                return Array.isArray(names) ? [...acc, ...names.map(name => [name, level])] : acc;
            }, []);

            Object.entries(changes).forEach(([level, names]) => {
                if (Array.isArray(names)) {
                    if (levels.includes(level)) TaskTree.fail('Unexpected level of changes');

                    names.forEach(name => {
                        types.set(name, level as ChangeLevel);
                    });
                }
            });
        }

        return types;
    }

    private getExclusions(): Map<ExclusionType, string[]> {
        const exclusions: Map<ExclusionType, string[]> = new Map();
        const {
            data: { output },
        } = this;

        if (output && output.exclude) {
            Object.entries<string[]>(output.exclude).forEach(([name, rules]) => {
                if (Object.values(ExclusionType).includes(name as ExclusionType)) {
                    exclusions.set(name as ExclusionType, [...new Set(rules)]);
                } else {
                    TaskTree.fail('Unexpected exclusion name');
                }
            });
        }

        return exclusions;
    }

    private getPlugins(): Map<string, IPluginOption> {
        const activePlugins: Map<string, IPluginOption> = new Map();
        const {
            data: { plugins },
        } = this;

        if (Array.isArray(plugins)) {
            plugins.forEach(plugin => {
                if (typeof plugin === 'string') {
                    activePlugins.set(plugin, {});
                } else {
                    Object.entries<IPluginOption>(plugin).forEach(([name, config]) => {
                        if (config) {
                            activePlugins.set(
                                name,
                                new Proxy(config, {
                                    get(target, fieldName, receiver): IPluginOption {
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
        const explorer = cosmiconfig(ConfigLoader.MODULE_NAME);
        const externalConfig = await explorer.search();
        const defaultConfig = await explorer.load(this.filePath);
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
