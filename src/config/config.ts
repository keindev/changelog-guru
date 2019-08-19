export type PluginOptionValue = string | boolean | number | string[];

export interface PluginOption {
    [key: string]: PluginOptionValue | PluginOption | PluginOption[] | undefined;
}

export enum ServiceProvider {
    GitHub = 'github',
    GitLab = 'gitlab',
}

export enum ChangeLevel {
    Major = 'major',
    Minor = 'minor',
    Patch = 'patch',
}

export enum ExclusionType {
    AuthorLogin = 'authorLogin',
    CommitType = 'commitType',
    CommitScope = 'commitScope',
    CommitSubject = 'commitSubject',
}

export interface ConfigOptions {
    provider: ServiceProvider;
    filePath: string;
    types: Map<string, ChangeLevel>;
    exclusions: Map<ExclusionType, string[]>;
    plugins: Map<string, PluginOption>;
}

export class Config {
    public readonly filePath: string;
    public readonly provider: ServiceProvider;

    private types: Map<string, ChangeLevel>;
    private plugins: Map<string, PluginOption>;
    private exclusions: Map<ExclusionType, string[]>;

    public constructor(options: ConfigOptions) {
        this.provider = options.provider;
        this.filePath = options.filePath;
        this.types = options.types;
        this.plugins = options.plugins;
        this.exclusions = options.exclusions;
    }

    public getPlugin(name: string): PluginOption | undefined {
        return this.plugins.get(name);
    }

    public getPlugins(): [string, PluginOption][] {
        return [...this.plugins.entries()];
    }

    public getTypes(): [string, ChangeLevel][] {
        return [...this.types.entries()];
    }

    public getExclusions(): [ExclusionType, string[]][] {
        return [...this.exclusions.entries()];
    }
}
