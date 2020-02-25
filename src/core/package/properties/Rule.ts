import { SemVer } from 'semver';



export enum Dependency {
    // https://docs.npmjs.com/files/package.json#engines
    Engines = 'engines',
    // https://docs.npmjs.com/files/package.json#dependencies
    Dependencies = 'dependencies',
    // https://docs.npmjs.com/files/package.json#devdependencies
    DevDependencies = 'devDependencies',
    // https://docs.npmjs.com/files/package.json#peerdependencies
    PeerDependencies = 'peerDependencies',
    // https://docs.npmjs.com/files/package.json#optionaldependencies
    OptionalDependencies = 'optionalDependencies',
}

export enum Restriction {
    // https://docs.npmjs.com/files/package.json#bundleddependencies
    BundledDependencies = 'bundledDependencies',
    // https://docs.npmjs.com/files/package.json#os
    OS = 'os',
    // https://docs.npmjs.com/files/package.json#cpu
    CPU = 'cpu',
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

export default class Rule<T = Dependency | Restriction> {
    readonly type: T;

    protected changes = new Map<string, IChange>();

    constructor(type: T) {
        this.type = type;
    }

    getChanges(type: Type): IChange[] {
        return [...this.changes.values()].filter(change => change.type === type);
    }
}
