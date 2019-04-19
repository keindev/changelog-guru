import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'
import { ReadonlyArray } from '../utils/types';
import { ProviderName } from './providers/provider';

const fileName = '.changelog.yaml';
const load = (p: string): Options => yaml.safeLoad(fs.readFileSync(p, 'utf8')) || {};
const defaultConfig: Options = load(path.join(__dirname, '../../', fileName));

export type OptionValue = string | string[] | boolean | undefined;

export interface Option {
    [key: string]: Option | OptionValue;
}

export interface Options extends Option {
    config?: string;
    types?: string[];
    plugins?: string[];
    provider?: ProviderName;
    [key: string]: Option | OptionValue;
}

export default class Config {
    public readonly plugins: ReadonlyArray<string> = defaultConfig.plugins || [];
    public readonly types: ReadonlyArray<string>;
    public readonly provider: ProviderName;
    public readonly options: Option;

    public constructor(options?: Options) {
        let config: Options = Object.assign({}, defaultConfig, options || {});
        let { config: filePath } = config;

        if (typeof filePath === 'string') {
            filePath = path.resolve(process.cwd(), filePath);

            if (typeof filePath === 'string' && filePath.length && fs.existsSync(filePath)) {
                config = Object.assign({}, config, load(filePath));
            }
        }

        this.provider = config.provider || ProviderName.None;
        this.types = config.types || [];
        this.plugins = this.plugins.concat(config.plugins || []);
        this.options = new Proxy(config as Option, {
            get(target, name, receiver): Option | undefined {
                return Reflect.get(target, name, receiver);
            }
        });
    }
}
