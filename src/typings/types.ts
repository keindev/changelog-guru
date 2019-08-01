import { ConfigLoaderOptions } from '../config/typings/types';

export type ValueOf<T> = T[keyof T];

export interface ChangelogOptions extends ConfigLoaderOptions {
    bump?: boolean;
    branch?: string;
}
