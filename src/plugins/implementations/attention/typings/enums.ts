export enum AttentionType {
    License = 'license',
    Engines = 'engines',
    Dependencies = 'dependencies',
    DevDependencies = 'devDependencies',
    PeerDependencies = 'peerDependencies',
    OptionalDependencies = 'optionalDependencies',
}

export enum AttentionTemplateLiteral {
    Name = '%name%',
    Version = '%ver%',
    PrevVersion = '%pver%',
    Value = '%val%',
    PrevValue = '%pval%',
}
