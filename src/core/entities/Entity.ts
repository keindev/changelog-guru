import { ChangeLevel } from '../Config';

export enum Priority {
    High = 1000,
    Medium = 100,
    Low = 1,
}

export enum Compare {
    More = 1,
    Less = -1,
    Equal = 0,
}

const priorities = {
    [ChangeLevel.Major]: Priority.High,
    [ChangeLevel.Minor]: Priority.Medium,
    [ChangeLevel.Patch]: Priority.Low,
};

export default class Entity {
    static SHORT_NAME_LENGTH = 7;

    readonly name: string;

    private ignored = false;
    private level: ChangeLevel = ChangeLevel.Patch;

    constructor(name?: string) {
        this.name = name || `f${(~~(Math.random() * 1e8)).toString(16)}`;
    }

    static compare(a: Entity, b: Entity): Compare {
        return Math.min(Math.max(b.priority - a.priority, Compare.Less), Compare.More);
    }

    static filter(e: Entity): boolean {
        return !e.isEmpty && !e.isIgnored;
    }

    get shortName(): string {
        return this.name.substr(0, Entity.SHORT_NAME_LENGTH);
    }

    get priority(): Priority {
        return priorities[this.level];
    }

    get changeLevel(): ChangeLevel {
        return this.level;
    }

    set changeLevel(level: ChangeLevel) {
        this.level = level;
    }

    get isIgnored(): boolean {
        return this.ignored;
    }

    get isEmpty(): boolean {
        return this.ignored;
    }

    ignore(condition?: boolean): void {
        this.ignored = this.ignored || (typeof condition === 'boolean' ? condition : true);
    }
}
