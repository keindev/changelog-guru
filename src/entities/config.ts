import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { TaskTree } from 'tasktree-cli';
import { ProviderName } from '../providers/provider';
import { Option, OptionValue } from '../utils/types';
import Key from '../utils/key';
import { Type } from '../utils/enums';

const $tasks = TaskTree.tree();

export interface ConfigOptions extends Option {
    config?: string;
    types?: {
        major?: string[];
        minor?: string[];
        patch?: string[];
    };
    plugins?: string[];
    provider?: ProviderName;
    [key: string]: Option | OptionValue;
}

export default class Config {
    public static FILE_NAME = '.changelog.yaml';

    public readonly plugins: readonly string[] = [];
    public readonly options: Option;
    public readonly provider: ProviderName;

    private prefixes: Map<string, Type> = new Map();

    public constructor(options?: ConfigOptions) {
        const task = $tasks.add('Config initializing');
        const defaultConfig = Config.load();
        let config = Object.assign({}, defaultConfig, options || {});
        let { config: filePath } = config;

        if (filePath) {
            filePath = path.resolve(process.cwd(), filePath);

            if (fs.existsSync(filePath)) {
                config = Object.assign({}, config, Config.load(filePath));
                task.log(`Used config file from: ${filePath}`);
            } else {
                task.warn(`File ${chalk.bold(Config.FILE_NAME)} is not exists`);
                task.log(`Used default config`);
            }
        } else {
            task.log(`Used default config`);
        }

        const { types } = config;

        if (typeof types === 'object') {
            this.addPrefixes(types.major, Type.Major);
            this.addPrefixes(types.minor, Type.Minor);
            this.addPrefixes(types.patch, Type.Patch);
        }

        if (Array.isArray(defaultConfig.plugins) && Array.isArray(config.plugins)) {
            this.plugins = [...new Set(defaultConfig.plugins.concat(config.plugins))];
        }

        this.provider = config.provider || ProviderName.GitHub;
        this.options = new Proxy(config as Option, {
            get(target, name, receiver): Option | undefined {
                return Reflect.get(target, name, receiver);
            },
        });

        task.complete('Config initialized');
    }

    private static load(filePath: string = path.join(__dirname, '../../', Config.FILE_NAME)): ConfigOptions {
        return yaml.safeLoad(fs.readFileSync(filePath, 'utf8')) || {};
    }

    public getType(prefix?: string): Type {
        let type: Type | undefined;

        if (prefix) type = Key.inMap(prefix, this.prefixes);

        return type || Type.Patch;
    }

    private addPrefixes(list: string[] | undefined, type: Type): void {
        if (Array.isArray(list)) {
            const { prefixes } = this;

            list.forEach(
                (prefix): void => {
                    if (!prefixes.has(prefix)) prefixes.set(prefix, type);
                }
            );
        }
    }
}
