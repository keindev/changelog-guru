export type ConfigOptionValue = string | string[] | boolean | undefined;

export interface ConfigOption {
    [key: string]: ConfigOption | ConfigOptionValue;
}

export default interface Config {
    plugins: string[];
    types: string[];
    [key: string]: ConfigOption | ConfigOptionValue;
}
