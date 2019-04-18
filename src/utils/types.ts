export interface ReadonlyArray<T> extends Array<T> {
    readonly [n: number]: T;
}

export interface Constructable<T> {
    new(): T;
}

export interface Importable<T> {
    default: Constructable<T>
}
