export enum Status {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
    Hidden = 16
}

export enum Type {
    Major = 0,
    Minor = 1,
    Patch = 2
}

export enum Priority {
    High = 1000,
    Medium = 100,
    Low = 10,
    Default = 1
}

export enum Compare {
    More = 1,
    Less = -1,
    Equal = 0
}
