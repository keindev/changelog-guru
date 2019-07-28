import * as Enums from './enums';

export type Changes = { [key in Enums.Change]: string[] };
export type PluginOptionValue = string | boolean | number | string[];

export interface PluginOption {
    [key: string]: PluginOption | PluginOptionValue;
}

export interface Plugins {
    [key: string]: Plugin;
}

export interface ConfigurationOptions {
    provider: Enums.ServiceProvider;
    filePath: string;
    types: Map<string, Enums.Change>;
    plugins: Map<string, PluginOption>;
    exclusions: Map<Enums.Exclusion, string[]>;
}
