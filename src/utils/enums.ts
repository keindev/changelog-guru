export enum Status {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
    Hidden = 16,
}

export enum Level {
    Major = 1,
    Minor = 2,
    Patch = 3,
}

export enum Priority {
    High = 1000,
    Medium = 100,
    Low = 10,
    Default = 1,
}

export enum Compare {
    More = 1,
    Less = -1,
    Equal = 0,
}

export enum FilterType {
    AuthorLogin = 0,
    CommitType = 1,
    CommitScope = 2,
    CommitSubject = 3,
}

export enum Modification {
    Changed = 1,
    Unchanged = 2,
    Added = 3,
    Bumped = 4,
    Downgraded = 5,
    Removed = 6,
}
