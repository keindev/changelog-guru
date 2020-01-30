import Entity from './Entity';

export default class Message extends Entity {
    public readonly text: string;

    public constructor(text: string) {
        super();

        this.text = text;
    }

    public isEmpty(): boolean {
        return !this.text.trim().length;
    }
}
