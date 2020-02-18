import Entity from './Entity';

export default class Message extends Entity {
    readonly text: string;

    constructor(text: string) {
        super();

        this.text = text;
    }

    get isEmpty(): boolean {
        return !this.text.trim().length;
    }
}
