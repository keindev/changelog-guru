import path from 'path';
import cosmiconfig from 'cosmiconfig';
import { Task } from 'tasktree-cli/lib/task';
import { ServiceProvider } from '../providers/provider';
import { Option, OptionValue } from '../utils/types';
import Key from '../utils/key';
import { Level, FilterType } from '../utils/enums';

export interface Levels extends Option {
    major?: string[];
    minor?: string[];
    patch?: string[];
}

export interface Filters extends Option {
    authors?: string[];
    types?: string[];
    scopes?: string[];
    subjects?: string[];
}

export interface ConfigurationOptions extends Option {
    config?: string;
    levels?: Levels;
    plugins?: string[];
    provider?: ServiceProvider;
    ignore?: Filters;
    [key: string]: Option | OptionValue;
}

export class Configuration {
    public static FILE_NAME = '.changelogrc.yaml';

    private provider: ServiceProvider | undefined;
    private plugins: Set<string> = new Set();
    private levels: Map<string, Level> = new Map();
    private filters: Map<FilterType, string[]> = new Map();
    private options: Option = {};

    public getProvider(): ServiceProvider {
        return this.provider || ServiceProvider.GitHub;
    }

    public getPlugins(): string[] {
        return [...this.plugins.values()];
    }

    public getLevels(): Map<string, Level> {
        return this.levels;
    }

    /*
    public getLevel(type: string): Level {
        return Key.inMap(type, this.levels) || Level.Patch;
    }
    */

    public getFilters(type: FilterType): string[] {
        return this.filters.get(type) || [];
    }

    public getOptions(): ConfigurationOptions {
        return this.options;
    }

    public async load(task: Task): Promise<void> {
        const explorer = cosmiconfig('changelog');
        const userConfig = await explorer.search();
        const defaultConfig = await explorer.load(path.join(__dirname, '../../', Configuration.FILE_NAME));
        let options: ConfigurationOptions;

        if (defaultConfig && !defaultConfig.isEmpty) {
            if (userConfig && !userConfig.isEmpty) {
                options = Object.assign({}, defaultConfig.config, userConfig.config);

                task.log(`Use config file: ${path.relative(process.cwd(), userConfig.filepath)}`);
            } else {
                options = defaultConfig.config;

                task.log(`Use default config file: ${path.relative(process.cwd(), defaultConfig.filepath)}`);
            }

            this.initLevels(options.levels);
            this.initFilters(options.ignore);

            this.provider = options.provider;
            this.plugins = new Set(defaultConfig.config.plugins.concat(options.plugins));
            this.options = new Proxy(options as Option, {
                get(target, name, receiver): Option | undefined {
                    return Reflect.get(target, name, receiver);
                },
            });
        } else {
            task.fail('Default configuration file not found');
        }
    }

    private initLevels(levels?: Levels): void {
        this.levels = new Map();

        if (typeof levels === 'object') {
            const append = (types: string[] | undefined, level: Level): void => {
                if (Array.isArray(types)) {
                    let name: string;

                    types.forEach((type): void => {
                        name = Key.unify(type);

                        if (name.length && !this.levels.has(name)) {
                            this.levels.set(name, level);
                        }
                    });
                }
            };

            append(levels.major, Level.Major);
            append(levels.minor, Level.Minor);
            append(levels.patch, Level.Patch);
        }
    }

    private initFilters(rules?: Filters): void {
        this.filters = new Map();

        if (typeof rules === 'object') {
            const append = (list: string[] | undefined, type: FilterType): void => {
                if (Array.isArray(list)) {
                    this.filters.set(type, [...new Set(list)].filter((filter): boolean => !!Key.unify(filter).length));
                }
            };

            append(rules.authors, FilterType.AuthorLogin);
            append(rules.types, FilterType.CommitType);
            append(rules.scopes, FilterType.CommitScope);
            append(rules.subjects, FilterType.CommitSubject);
        }
    }
}
