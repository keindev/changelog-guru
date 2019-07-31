import { ChangeLevel, ExclusionType, ServiceProvider } from './enums';

export type Changes = { [key in ChangeLevel]: string[] };
export type PluginOptionValue = string | boolean | number | string[];

export interface PluginOption {
    [key: string]: PluginOptionValue | PluginOption | PluginOption[] | undefined;
}

export interface ConfigLoaderOptions {
    provider?: ServiceProvider;
    filePath?: string;
    types?: Map<string, ChangeLevel>;
    exclusions?: Map<ExclusionType, string[]>;
}

export interface ConfigOptions {
    provider: ServiceProvider;
    filePath: string;
    types: Map<string, ChangeLevel>;
    exclusions: Map<ExclusionType, string[]>;
    plugins: Map<string, PluginOption>;
}
