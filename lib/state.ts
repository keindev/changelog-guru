import Section from './section';

export default class State {

    private static DEFALUT_VERSION = '1.0.0';

    private version: string;

    private commits: string[] = [];

    private sections: Section[] = [];

    public constructor(version: string = State.DEFALUT_VERSION) {
        this.version = version;
    }

    public addSection(name: string, patterns: string[]): void {
        this.sections.push(new Section(name, patterns));
    }
}
