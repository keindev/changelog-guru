
class Section {
    private name: string;
    private patterns: string[];

    constructor(name: string, patterns: string[]) {
        this.name = name;
        this.patterns = patterns;
    }
}

export default class State {
    static DEFALUT_VERSION = "1.0.0";

    private version: string;
    private commits: string[] = [];
    private sections: Section[] = [];

    constructor(version: string = State.DEFALUT_VERSION) {
        this.version = version;
    }

    public addSection(name: string, patterns: string[]) {
        this.sections.push(new Section(name, patterns));
    }

    public addCommit() {
        // TODO:
    }
}
