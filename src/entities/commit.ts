import { Type, Status, Priority, Compare } from '../utils/enums';

export interface CommitOptions {
    timestamp: number;
    message: string;
    url: string;
    author: string;
}

export default class Commit {
    public static PREFIX_DELIMITER = ',';
    public static PREFIX_MAIN_INDEX = 0;
    public static LINE_DELIMITER = '\n';
    public static NAME_LENGTH = 7;

    public readonly title: string;
    public readonly body: readonly string[];
    public readonly timestamp: number;
    public readonly url: string;
    public readonly hash: string;
    public readonly author: string;

    private scope: string | undefined;
    private prefixes: string[] = [];
    private accents: Set<string> = new Set();
    private type: Type = Type.Patch;
    private status: number = Status.Default;

    public constructor(hash: string, options: CommitOptions) {
        const lines = options.message.split(Commit.LINE_DELIMITER).map((l): string => l.trim());
        const header = lines.shift();

        this.hash = hash;
        this.timestamp = options.timestamp;
        this.body = lines;
        this.url = options.url;
        this.author = options.author;
        this.title = '';

        if (header) {
            const match = header.match(/(?<p>[a-z, ]+) {0,1}(\((?<s>[a-z,/:-]+)\)){0,1}(?=:):(?<t>[\S ]+)/i);

            if (match) {
                const { groups } = match;

                if (groups) {
                    const { p: prefixes, s: scope, t: title } = groups;

                    if (prefixes) this.prefixes.push(...prefixes.split(Commit.PREFIX_DELIMITER).filter(Boolean));
                    if (scope) this.scope = scope.trim();
                    if (title) this.title = title.trim();
                }
            }
        }
    }

    public static compare(a: Commit, b: Commit): number {
        const scopeA = a.getScope();
        const scopeB = b.getScope();
        let result = Compare.Equal;

        if (scopeA && !scopeB) result--;
        if (!scopeA && scopeB) result++;
        if (scopeA && scopeB) result = scopeA.localeCompare(scopeB);
        if (result === Compare.Equal) result = a.timestamp - b.timestamp;

        return result;
    }

    public setType(type: Type): void {
        if (type < this.type) this.type = type;
    }

    public setStatus(status: Status): void {
        this.status = this.status | status;

        if (this.hasStatus(Status.BreakingChanges)) this.setType(Type.Major);
        if (this.hasStatus(Status.Deprecated)) this.setType(Type.Minor);
    }

    public getType(): Type {
        return this.type;
    }

    public getPrefix(index: number = Commit.PREFIX_MAIN_INDEX): string | undefined {
        return this.prefixes[index];
    }

    public getScope(): string | undefined {
        return this.scope;
    }

    public getPriority(): number {
        let priority = Priority.Default;

        if (this.hasStatus(Status.BreakingChanges)) priority += Priority.High;
        if (this.hasStatus(Status.Deprecated)) priority += Priority.Medium;
        if (this.hasStatus(Status.Important)) priority += Priority.Low;

        return priority;
    }

    public getName(): string {
        return this.hash.substr(0, Commit.NAME_LENGTH);
    }

    public getAccents(): string[] {
        return [...this.accents.values()];
    }

    public addAccent(text: string): void {
        this.accents.add(text);
    }

    public hasStatus(status: Status): boolean {
        return !!(this.status & status);
    }
}
