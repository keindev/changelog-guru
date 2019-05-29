import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { TaskTree } from 'tasktree-cli';
import { ProviderName } from '../providers/provider';
import { Option, OptionValue } from '../utils/types';
import Key from '../utils/key';
import { Level } from '../utils/enums';

const $tasks = TaskTree.tree();

export interface ConfigOptions extends Option {
    config?: string;
    levels?: {
        major?: string[];
        minor?: string[];
        patch?: string[];
    };
    plugins?: string[];
    provider?: ProviderName;
    [key: string]: Option | OptionValue;
}

// TODO: refactor
export default class Config {
    public static FILE_NAME = '.changelog.yaml';

    public readonly plugins: readonly string[] = [];
    public readonly options: Option;
    public readonly provider: ProviderName;

    private types: Map<string, Level> = new Map();

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

        const { levels } = config;

        if (typeof levels === 'object') {
            this.addTypes(levels.major, Level.Major);
            this.addTypes(levels.minor, Level.Minor);
            this.addTypes(levels.patch, Level.Patch);
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

    public getLevel(type: string): Level {
        return Key.inMap(type, this.types) || Level.Patch;
    }

    private addTypes(list: string[] | undefined, level: Level): void {
        if (Array.isArray(list)) {
            const { types } = this;

            list.forEach(
                (type): void => {
                    if (!types.has(type)) types.set(type, level);
                }
            );
        }
    }
}
