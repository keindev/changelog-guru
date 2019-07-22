export type OptionValue = string | string[] | boolean | undefined;

export interface Constructable<T, C> {
    new (context: C): T;
}

export interface Importable<T, C> {
    default: Constructable<T, C>;
}

export interface Option {
    [key: string]: Option | OptionValue;
}

export interface Values {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
