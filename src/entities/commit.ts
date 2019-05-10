export enum Status {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
    Hidden = 16
}

export enum Type {
    Major = 0,
    Minor = 1,
    Patch = 2
}

export default class Commit {
    public readonly header: string;
    public readonly title: string;
    public readonly body: ReadonlyArray<string>;
    public readonly timestamp: number;
    public readonly url: string;
    public readonly sha: string;
    public readonly author: string;

    private scope: string | undefined;
    private prefixes: string[] = [];
    private accents: Set<string> = new Set();
    private type: Type = Type.Patch;
    private status: number = Status.Default;

    public static compare(a: Commit, b: Commit): number {
        const scopeA = a.getScope();
        const scopeB = b.getScope();
        let result = 0;

        if (scopeA && !scopeB) result--;
        if (!scopeA && scopeB) result++;
        if (scopeA && scopeB) result = scopeA.localeCompare(scopeB);
        if (result === 0) result = a.timestamp - b.timestamp;

        return result;
    }

    public constructor(sha: string, timestamp: number, message: string, url: string, author: string) {
        const lines = message.split('\n').map((line): string => line.trim());

        this.sha = sha;
        this.timestamp = timestamp;
        this.header = (lines.shift() || '').trim();
        this.body = lines;
        this.url = url;
        this.author = author;
        this.title = '';

        const match = this.header.match(
            /(?<prefixes>[a-z, ]+) {0,1}(\((?<scope>[a-z,/:-]+)\)){0,1}(?=:):(?<title>[\S ]+)/i
        );

        if (match && match.groups) {
            const {
                groups: { prefixes, scope, title }
            } = match;

            if (prefixes) this.prefixes = prefixes.split(',').filter((prefix): boolean => !!prefix);
            if (scope) this.scope = scope;
            if (title) this.title = title.trim();
        }
    }

    public setType(type: Type): void {
        if (type < this.type) this.type = type;
    }

    public getType(): Type {
        return this.type;
    }

    public getPrefix(index: number = 0): string | undefined {
        return this.prefixes[index];
    }

    public getScope(): string | undefined {
        return this.scope;
    }

    public getWeight(): number {
        const { status } = this;
        let weight = 0;

        if (status & Status.BreakingChanges) weight += 1000;
        if (status & Status.Deprecated) weight += 100;
        if (status & Status.Important) weight += 10;
        if (status & Status.Default) weight += 1;

        return weight;
    }

    public getShotSHA(): string {
        return this.sha.substr(0, 7);
    }

    public addAccent(text: string): void {
        this.accents.add(text);
    }

    public getAccents(): string[] {
        return [...this.accents.values()];
    }

    public setStatus(status: Status): void {
        this.status = this.status | status;

        if (this.status & Status.BreakingChanges) this.setType(Type.Major);
        if (this.status & Status.Deprecated) this.setType(Type.Minor);
    }

    public checkStatus(...statuses: Status[]): boolean {
        return statuses.every((status): boolean => !!(this.status & status));
    }
}
