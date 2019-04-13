type OptionValue = string | number | boolean | string[];
type Option = { [key: string]: OptionValue };

export default interface Config {
    plugins: string[];
    types: string[];
    [key: string]: OptionValue | Option | Option[] | undefined;
}
