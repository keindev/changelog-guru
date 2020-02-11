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

export interface IConfigOptions {
    provider: ServiceProvider;
    filePath: string;
    types: Map<string, ChangeLevel>;
    exclusions: Map<ExclusionType, string[]>;
    plugins: Map<string, IPluginOption>;
}

export default class Config {
    readonly filePath: string;
    readonly provider: ServiceProvider;

    // FIXME: rename after update to TS 3.8
    private types: Map<string, ChangeLevel>;
    private plugins: Map<string, IPluginOption>;
    private exclusions: Map<ExclusionType, string[]>;

    constructor(options: IConfigOptions) {
        this.provider = options.provider;
        this.filePath = options.filePath;
        this.types = options.types;
        this.plugins = options.plugins;
        this.exclusions = options.exclusions;
    }

    get plugins(): [string, IPluginOption][] {
        return [...this.plugins.entries()];
    }

    get types(): [string, ChangeLevel][] {
        return [...this.types.entries()];
    }

    get exclusions(): [ExclusionType, string[]][] {
        return [...this.exclusions.entries()];
    }

    public getPlugin(name: string): IPluginOption | undefined {
        return this.plugins.get(name);
    }
}
