import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import { Config } from './config';
import { ServiceProvider, ChangeLevel, ExclusionType } from './typings/enums';
import { PluginOption } from './typings/types';

export class Loader {
    public static MODULE_NAME = 'changelog';
    public static DEFAULT_CONFIG_PATH = `../../../.changelogrc.yaml`;
    public static DEFAULT_OUTPUT_FILE_NAME = 'CHANGELOG.md';

    private filePath: string = path.join(__dirname, Loader.DEFAULT_CONFIG_PATH);
    private data: cosmiconfig.Config = {};

    public async load(): Promise<Config> {
        const task = TaskTree.tree().add('Reading configuration file...');
        const filePath = await this.loadConfig();
        let config: Config | undefined;

        if (filePath) {
            const { data } = this;

            config = new Config({
                provider: data.provider || ServiceProvider.GitHub,
                filePath: this.getOutputFilePath(),
                types: this.getTypes(),
                plugins: this.getPlugins(),
                exclusions: this.getExclusions(),
            });

            task.complete(`Config file: ${path.relative(process.cwd(), filePath)}`);
        } else {
            task.fail('Default configuration file not found');
        }

        return config as Config;
    }

    private getOutputFilePath(): string {
        const {
            data: { output },
        } = this;

        return output && output.filePath ? output.filePath : Loader.DEFAULT_OUTPUT_FILE_NAME;
    }

    private getTypes(): Map<string, ChangeLevel> {
        const types: Map<string, ChangeLevel> = new Map();
        const {
            data: { changes },
        } = this;

        if (changes) {
            Object.entries<string[]>(changes).forEach(([level, names]): void => {
                if (Array.isArray(names)) {
                    if (Object.values(ChangeLevel).includes(level)) {
                        names.forEach((name): void => {
                            types.set(name, level as ChangeLevel);
                        });
                    } else {
                        TaskTree.tree().fail('Unexpected level of changes (expected: major, minor or patch)');
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
            Object.entries<string[]>(output.exclude).forEach(([name, rules]): void => {
                if (Object.values(ExclusionType).includes(name)) {
                    exclusions.set(name as ExclusionType, [...new Set(rules)]);
                } else {
                    TaskTree.tree().fail('Unexpected exclusion name');
                }
            });
        }

        return exclusions;
    }

    private getPlugins(): Map<string, PluginOption> {
        const activePlugins: Map<string, PluginOption> = new Map();
        const {
            data: { plugins },
        } = this;

        if (plugins) {
            Object.entries<PluginOption>(plugins).forEach(([name, config]): void => {
                if (config) {
                    activePlugins.set(
                        name,
                        new Proxy(config, {
                            get(target, fieldName, receiver): PluginOption {
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

        return activePlugins;
    }

    private async loadConfig(): Promise<string | undefined> {
        const explorer = cosmiconfig(Loader.MODULE_NAME);
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
