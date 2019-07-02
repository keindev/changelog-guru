import path from 'path';
import cosmiconfig from 'cosmiconfig';
import { TaskTree } from 'tasktree-cli';
import { ProviderName } from '../providers/provider';
import { Option, OptionValue } from '../utils/types';
import Key from '../utils/key';
import { Level, FilterType } from '../utils/enums';

const $tasks = TaskTree.tree();
const $explorer = cosmiconfig('changelog');

export interface LevelsConfigOptions extends Option {
    major?: string[];
    minor?: string[];
    patch?: string[];
}

export interface FiltersConfigOptions extends Option {
    authors?: string[];
    types?: string[];
    scopes?: string[];
    subjects?: string[];
}

export interface ConfigOptions extends Option {
    config?: string;
    levels?: LevelsConfigOptions;
    plugins?: string[];
    provider?: ProviderName;
    ignore?: FiltersConfigOptions;
    [key: string]: Option | OptionValue;
}

export class Config {
    public static DEFAULT = '.changelogrc.yaml';

    private provider: ProviderName = ProviderName.GitHub;
    private plugins: Set<string> = new Set();
    private types: Map<string, Level> = new Map();
    private filters: Map<FilterType, string[]> = new Map();
    private options: Option = {};

    public getProvider(): string {
        return this.provider;
    }

    public getPlugins(): string[] {
        return [...this.plugins.values()];
    }

    public getLevel(type: string): Level {
        return Key.inMap(type, this.types) || Level.Patch;
    }

    public getFilters(type: FilterType): string[] {
        return this.filters.get(type) || [];
    }

    public getOptions(): ConfigOptions {
        return this.options;
    }

    public async load(): Promise<void> {
        const task = $tasks.add('Config initializing');
        const userConfig = await $explorer.search();
        const defaultConfig = await $explorer.load(path.join(__dirname, '../../', Config.DEFAULT));
        let options: ConfigOptions;

        if (defaultConfig && !defaultConfig.isEmpty) {
            if (userConfig && !userConfig.isEmpty) {
                task.log(`Use config file: ${userConfig.filepath}`);

                options = Object.assign({}, defaultConfig.config, userConfig.config);
            } else {
                options = defaultConfig.config;
            }

            this.loadProvider(options.provider);
            this.loadPlugins(defaultConfig.config.plugins, options.plugins);
            this.loadLevels(options.levels);
            this.loadFilters(options.ignore);
            this.options = new Proxy(options as Option, {
                get(target, name, receiver): Option | undefined {
                    return Reflect.get(target, name, receiver);
                },
            });

            task.complete('Config initialized');
        } else {
            task.fail('Default config file not found');
        }
    }

    private loadProvider(name?: ProviderName): void {
        this.provider = typeof name === 'string' && name.length ? name : ProviderName.GitHub;
    }

    private loadPlugins(core?: string[], extended?: string[]): void {
        const getList = (list?: string[]): string[] => (Array.isArray(list) ? list : []);

        this.plugins = new Set(getList(core).concat(getList(extended)));
    }

    private loadLevels(levels?: LevelsConfigOptions): void {
        this.types = new Map();

        if (typeof levels === 'object') {
            const { types } = this;
            const addLevel = (list: string[] | undefined, level: Level): void => {
                if (Array.isArray(list)) {
                    list.forEach((type): void => {
                        if (!types.has(type) && type.length) types.set(type, level);
                    });
                }
            };

            addLevel(levels.major, Level.Major);
            addLevel(levels.minor, Level.Minor);
            addLevel(levels.patch, Level.Patch);
        }
    }

    private loadFilters(rules?: FiltersConfigOptions): void {
        this.filters = new Map();

        if (typeof rules === 'object') {
            const { filters } = this;
            const addFilter = (list: string[] | undefined, type: FilterType): void => {
                if (Array.isArray(list)) filters.set(type, [...new Set(list)].filter(Boolean));
            };

            addFilter(rules.authors, FilterType.AuthorLogin);
            addFilter(rules.types, FilterType.CommitType);
            addFilter(rules.scopes, FilterType.CommitScope);
            addFilter(rules.subjects, FilterType.CommitSubject);
        }
    }
}
