import path from 'path';
import cosmiconfig from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { TaskTree } from 'tasktree-cli';
import { Configuration } from './configuration';
import * as Enums from './enums';
import * as Types from './types';

const $tasks = TaskTree.tree();

export class ConfigurationLoader {
    public static DEFAULT_PATH = '../../../.changelogrc.yaml';
    public static DEFAULT_OUTPUT_FILE_NAME = 'CHANGELOG.md';

    private filePath: string = path.join(__dirname, ConfigurationLoader.DEFAULT_PATH);
    private data: cosmiconfig.Config = {};

    public async load(): Promise<Configuration> {
        const task = $tasks.add('Reading configuration file...');
        const filePath = await this.loadConfig();
        let config: Configuration | undefined;

        if (filePath) {
            const { data } = this;

            config = new Configuration({
                provider: data.provider || Enums.ServiceProvider.GitHub,
                filePath: this.getOutputFilePath(),
                types: this.getTypes(),
                plugins: this.getPlugins(),
                exclusions: this.getExclusions(),
            });

            task.complete(`Config file: ${path.relative(process.cwd(), filePath)}`);
        } else {
            task.fail('Default configuration file not found');
        }

        return config as Configuration;
    }

    private getOutputFilePath(): string {
        const {
            data: { output },
        } = this;

        return output && output.filePath ? output.filePath : ConfigurationLoader.DEFAULT_OUTPUT_FILE_NAME;
    }

    private getTypes(): Map<string, Enums.Change> {
        const types: Map<string, Enums.Change> = new Map();
        const {
            data: { changes },
        } = this;

        if (changes) {
            Object.entries<string[]>(changes).forEach(([level, names]): void => {
                if (Array.isArray(names)) {
                    if (Object.values(Enums.Change).includes(level)) {
                        names.forEach((name): void => {
                            types.set(name, level as Enums.Change);
                        });
                    } else {
                        $tasks.fail('Unexpected level of changes (expected: major, minor or patch)');
                    }
                }
            });
        }

        return types;
    }

    private getExclusions(): Map<Enums.Exclusion, string[]> {
        const exclusions: Map<Enums.Exclusion, string[]> = new Map();
        const {
            data: { output },
        } = this;

        if (output && output.exclude) {
            Object.entries<string[]>(output.exclude).forEach(([name, rules]): void => {
                if (Object.values(Enums.Exclusion).includes(name)) {
                    exclusions.set(name as Enums.Exclusion, [...new Set(rules)]);
                } else {
                    $tasks.fail('Unexpected exclusion name');
                }
            });
        }

        return exclusions;
    }

    private getPlugins(): Map<string, Types.PluginOption> {
        const activePlugins: Map<string, Types.PluginOption> = new Map();
        const {
            data: { plugins },
        } = this;

        if (plugins) {
            Object.entries<Types.PluginOption>(plugins).forEach(([name, config]): void => {
                if (config) {
                    activePlugins.set(
                        name,
                        new Proxy(config, {
                            get(target, fieldName, receiver): Types.PluginOption {
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
        const explorer = cosmiconfig('changelog');
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
