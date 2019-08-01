export enum DependencyType {
    // https://docs.npmjs.com/files/package.json#engines
    Engines = 1,
    // https://docs.npmjs.com/files/package.json#dependencies
    Dependencies = 2,
    // https://docs.npmjs.com/files/package.json#devdependencies
    Dev = 3,
    // https://docs.npmjs.com/files/package.json#peerdependencies
    Peer = 4,
    // https://docs.npmjs.com/files/package.json#optionaldependencies
    Optional = 5,
}

export enum DependencyModification {
    Added = 'added',
    Bumped = 'bumped',
    Changed = 'changed',
    Downgraded = 'downgraded',
    Removed = 'removed',
    Unchanged = 'unchanged',
}
