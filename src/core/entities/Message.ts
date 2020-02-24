import Entity from './Entity';

export default class Message extends Entity {
    readonly text: string;

    constructor(text: string) {
        super();

        this.text = text.trim();
    }

    get empty(): boolean {
        return !this.text.length;
    }
}
