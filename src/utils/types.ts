export interface Constructable<T, C> {
    new (context: C): T;
}

export interface Importable<T, C> {
    default: Constructable<T, C>;
}

export type ValueOf<T> = T[keyof T];
