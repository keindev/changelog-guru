import Entity, { ChangeLevel } from './Entity';

export default class Message extends Entity {
    readonly text: string;

    constructor(text: string, level: ChangeLevel = ChangeLevel.Patch) {
        super();

        this.text = text.trim();
        this.level = level;
    }

    get empty(): boolean {
        return !this.text.length;
    }
}
