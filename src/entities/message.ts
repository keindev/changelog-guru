import { Level, Priority } from '../utils/enums';
import Key from '../utils/key';

export class Message {
    public readonly hash: string;
    public readonly text: string;
    public readonly level: Level;

    public constructor(text: string, level: Level) {
        this.hash = Key.hash();
        this.text = text;
        this.level = level;
    }

    public static compare(a: Message, b: Message): number {
        return a.level - b.level;
    }

    public static filter(m: Message): boolean {
        return !!m.text.length;
    }

    public getPriority(): Priority {
        let priority: Priority;

        switch (this.level) {
            case Level.Major:
                priority = Priority.High;
                break;
            case Level.Minor:
                priority = Priority.Medium;
                break;
            default:
                priority = Priority.Low;
                break;
        }

        return priority;
    }
}
