export default class Modifier {
    public readonly name: string;

    public constructor() {
        this.name = this.constructor.name;
    }
}
