import * as Enums from './enums';
import * as Types from './types';

export class Configuration {
    public readonly filePath: string;
    public readonly provider: Enums.ServiceProvider;

    private types: Map<string, Enums.Change>;
    private plugins: Map<string, Types.PluginOption>;
    private exclusions: Map<Enums.Exclusion, string[]>;

    public constructor(options: Types.ConfigurationOptions) {
        this.provider = options.provider;
        this.filePath = options.filePath;
        this.types = options.types;
        this.plugins = options.plugins;
        this.exclusions = options.exclusions;
    }

    public getPlugins(): [string, Types.PluginOption][] {
        return [...this.plugins.entries()];
    }

    public getTypes(): [string, Enums.Change][] {
        return [...this.types.entries()];
    }

    public getExclusions(type: Enums.Exclusion): string[] {
        return this.exclusions.get(type) || [];
    }

    /*
    public static fillFromEnum<T>(options: Option, enumeration: T, mapping: Map<ValueOf<T>, string>): void {
        Object.entries(options).forEach(([name, value]: [string, Option | OptionValue]): void => {
            if (typeof value === 'string') {
                const type = Object.values(enumeration).find((itemName): boolean => itemName === name);

                if (value && type) mapping.set(type, value);
            }
        });
    }


*/
}
