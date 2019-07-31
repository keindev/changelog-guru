export enum CommitStatus {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
}

export enum SectionPosition {
    None = 0,
    Subsection = 1,
    Group = 2,
    Footer = 3,
    Body = 4,
    Header = 5,
}

export enum SectionOrder {
    Default = 0,
    Max = Number.MAX_SAFE_INTEGER,
    Min = Number.MIN_SAFE_INTEGER,
}
