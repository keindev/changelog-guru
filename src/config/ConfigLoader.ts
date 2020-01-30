import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import Config, { ServiceProvider, ChangeLevel, ExclusionType, IPluginOption } from './Config';

export interface IConfigLoaderOptions {
    provider?: ServiceProvider;
    filePath?: string;
    types?: Map<string, ChangeLevel>;
    exclusions?: Map<ExclusionType, string[]>;
}

export default class ConfigLoader {
    public static MODULE_NAME = 'changelog';
    public static DEFAULT_CONFIG_PATH = `../../.changelogrc.default.yml`;
    public static DEFAULT_OUTPUT_FILE_NAME = 'CHANGELOG.md';

    private filePath: string = path.join(__dirname, ConfigLoader.DEFAULT_CONFIG_PATH);
    private data: cosmiconfig.Config = {};
    private options: IConfigLoaderOptions;

    public constructor(options?: IConfigLoaderOptions) {
        this.options = options || {};
    }

    public async load(): Promise<Config> {
        const task = TaskTree.add('Reading configuration file...');
        const filePath = await this.loadConfig();
        let config: Config | undefined;

        if (filePath) {
            const { data, options } = this;

            config = new Config({
                provider: options.provider || data.provider || ServiceProvider.GitHub,
                filePath: options.filePath || this.getOutputFilePath(),
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

    private getOutputFilePath(): string {
        const {
            data: { output },
        } = this;

        return output && output.filePath ? output.filePath : ConfigLoader.DEFAULT_OUTPUT_FILE_NAME;
    }

    private getTypes(): Map<string, ChangeLevel> {
        const types: Map<string, ChangeLevel> = new Map();
        const {
            data: { changes },
        } = this;

        if (changes) {
            Object.entries<string[]>(changes).forEach(([level, names]) => {
                if (Array.isArray(names)) {
                    if (Object.values(ChangeLevel).includes(level as ChangeLevel)) {
                        names.forEach(name => {
                            types.set(name, level as ChangeLevel);
                        });
                    } else {
                        TaskTree.fail('Unexpected level of changes (expected: major, minor or patch)');
                    }
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
