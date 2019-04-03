export type Configurable = string | number | string[];
export type ConfigurableStructure = { [key: string]: Configurable } | { [key: string]: Configurable }[];

export default interface Config {
    plugins: string[];
    types: string[];
    [key: string]: Configurable | ConfigurableStructure | undefined;
}
