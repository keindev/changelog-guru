import { SemVer } from 'semver';

export enum Type {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}

export interface IChange {
    name: string;
    type: Type;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;
}

export class Change implements IChange {
    name: string;
    type: Type;
    value?: string;
    link?: string;
    version?: SemVer;
    prevValue?: string;
    prevVersion?: SemVer;

    constructor(options: ) {
        this.name = name;
        this.type = type;
    }
}
