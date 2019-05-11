import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import Process from '../utils/process';
import { ProviderName } from '../providers/provider';
import { ReadonlyArray, Option, OptionValue } from '../utils/types';
import Key from '../utils/key';
import { Type } from '../utils/enums';

const $process = Process.getInstance();

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

    public readonly plugins: ReadonlyArray<string>;
    public readonly options: Option;
    public readonly provider: ProviderName;

    private prefixes: Map<string, Type> = new Map();

    public constructor(options?: ConfigOptions) {
        const task = $process.task('Config initializing');
        const defaultConfig = Config.load();
        let config = Object.assign({}, defaultConfig, options || {});
        let { config: filePath } = config;

        if (typeof filePath === 'string') {
            filePath = path.resolve(process.cwd(), filePath);

            if (typeof filePath === 'string' && filePath.length && fs.existsSync(filePath)) {
                config = Object.assign({}, config, Config.load(filePath));

                task.log(`Used config file from: ${filePath}`);
            } else {
                task.warn(`File ${chalk.bold(Config.FILE_NAME)} is not exists`);
                task.log(`Used default config`);
            }
        } else {
            task.log(`Used default config`);
        }

        if (typeof config.types === 'object') {
            this.addPrefixes(config.types.major, Type.Major);
            this.addPrefixes(config.types.minor, Type.Minor);
            this.addPrefixes(config.types.patch, Type.Patch);
        }

        this.provider = config.provider || ProviderName.GitHub;
        this.plugins = [...new Set((defaultConfig.plugins || []).concat(config.plugins || []))];
        this.options = new Proxy(config as Option, {
            get(target, name, receiver): Option | undefined {
                return Reflect.get(target, name, receiver);
            }
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
                (p): void => {
                    if (!prefixes.has(p)) prefixes.set(p, type);
                }
            );
        }
    }
}
