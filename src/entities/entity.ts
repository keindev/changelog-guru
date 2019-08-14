import { Priority, Compare } from '../typings/enums';
import { ChangeLevel } from '../config/config';

export class Entity {
    public static SHORT_NAME_LENGTH = 7;

    private ignored = false;
    private escaped = false;
    private level: ChangeLevel = ChangeLevel.Patch;
    private name: string;

    public constructor(name?: string) {
        this.name = name || `f${(~~(Math.random() * 1e8)).toString(16)}`;
    }

    public static compare(a: Entity, b: Entity): Compare {
        const result = b.getPriority() - a.getPriority();

        return Math.min(Math.max(result, Compare.Less), Compare.More);
    }

    public static filter(e: Entity): boolean {
        return !e.isEmpty() && !e.isIgnored();
    }

    public getName(): string {
        return this.name;
    }

    public getShortName(): string {
        return this.name.substr(0, Entity.SHORT_NAME_LENGTH);
    }

    public getPriority(): Priority {
        let priority: Priority;

        switch (this.level) {
            case ChangeLevel.Major:
                priority = Priority.High;
                break;
            case ChangeLevel.Minor:
                priority = Priority.Medium;
                break;
            default:
                priority = Priority.Low;
                break;
        }

        return priority;
    }

    public getChangeLevel(): ChangeLevel {
        return this.level;
    }

    public setChangeLevel(level: ChangeLevel): void {
        this.level = level;
    }

    public ignore(): void {
        this.ignored = true;
    }

    public isIgnored(): boolean {
        return this.ignored;
    }

    public escape(): void {
        this.escaped = true;
    }

    public isEscaped(): boolean {
        return this.escaped;
    }

    public isEmpty(): boolean {
        return this.ignored;
    }
}
