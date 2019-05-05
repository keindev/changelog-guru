export enum Status {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
    Hidden = 16
}

export default class Commit {
    public readonly header: string;
    public readonly body: ReadonlyArray<string>;
    public readonly timestamp: number;
    public readonly url: string;
    public readonly sha: string;
    public readonly author: string;

    private types: string[] = [];
    private prefixes: string[] = [];
    private scope: string | undefined;
    private status: number = Status.Default;

    public constructor(sha: string, timestamp: number, message: string, url: string, author: string) {
        const lines = message.split('\n').map((line): string => line.trim());

        this.sha = sha;
        this.timestamp = timestamp;
        this.header = (lines.shift() || '').trim();
        this.body = lines;
        this.url = url;
        this.author = author;

        const match = this.header.match(/(?<types>[a-z, ]+) {0,1}(\((?<scope>[a-z,/:-]+)\)){0,1}(?=:)/i);

        if (match && match.groups) {
            const {
                groups: { types, scope }
            } = match;

            if (types) this.types = types.split(',').filter((type): boolean => !!type);
            if (scope) this.scope = scope;
        }
    }

    public getType(index: number = 0): string | undefined {
        return this.types[index];
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

    public addPrefix(text: string): void {
        if (text.length) {
            this.prefixes.push(text);
        }
    }

    public setStatus(status: Status): void {
        this.status = this.status | status;
    }

    public checkStatus(...statuses: Status[]): boolean {
        return statuses.every((status): boolean => !!(this.status & status));
    }
}
