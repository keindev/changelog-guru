export default class Section {
    private name: string;
    private patterns: string[];

    public constructor(name: string, patterns: string[]) {
        this.name = name;
        this.patterns = patterns;
    }
}
