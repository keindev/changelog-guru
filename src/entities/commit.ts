import { Level, Status, Priority, Compare } from '../utils/enums';

export interface CommitOptions {
    timestamp: number;
    message: string;
    url: string;
    author: string;
}

export default class Commit {
    public static LINE_SEPARATOR = '\n';
    public static SHORT_HASH_LENGTH = 7;

    public readonly subject: string = '';
    public readonly body: readonly string[];
    public readonly timestamp: number;
    public readonly url: string;
    public readonly hash: string;
    public readonly author: string;

    private scope: string | undefined;
    private type: string | undefined;
    private accents: Set<string> = new Set();
    private level = Level.Patch;
    private status = Status.Default;
    private ignored = false;

    public constructor(hash: string, options: CommitOptions) {
        const lines = options.message.split(Commit.LINE_SEPARATOR).map((l): string => l.trim());
        const header = lines.shift();

        this.hash = hash;
        this.timestamp = options.timestamp;
        this.body = lines;
        this.url = options.url;
        this.author = options.author;

        if (header) {
            const match = header.match(
                // <type>(<scope>): <subject>
                /^(?<type>[a-z ]+) {0,1}(\((?<scope>[a-z0-9,:-]+)\)){0,1}(?=:):(?<subject>[\S ]+)/i
            );

            if (match) {
                const { groups } = match;

                if (groups) {
                    const { type, scope, subject } = groups;

                    if (type) this.type = type.trim();
                    if (scope) this.scope = scope.trim();
                    if (subject) this.subject = subject.trim();
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

    public getAccents(): string[] {
        return [...this.accents.values()];
    }

    public getLevel(): Level {
        return this.level;
    }

    public setLevel(level: Level): void {
        this.level = level;
    }

    public getType(): string | undefined {
        return this.type;
    }

    public getPriority(): number {
        let priority = Priority.Default;

        if (this.hasStatus(Status.BreakingChanges)) priority += Priority.High;
        if (this.hasStatus(Status.Deprecated)) priority += Priority.Medium;
        if (this.hasStatus(Status.Important)) priority += Priority.Low;

        return priority;
    }

    public getScope(): string | undefined {
        return this.scope;
    }

    public getShortHash(): string {
        return this.hash.substr(0, Commit.SHORT_HASH_LENGTH);
    }

    public setStatus(status: Status): void {
        this.status = this.status | status;

        if (this.hasStatus(Status.BreakingChanges)) this.setLevel(Level.Major);
        if (this.hasStatus(Status.Deprecated)) this.setLevel(Level.Minor);
    }

    public addAccent(text: string): void {
        this.accents.add(text);
    }

    public hasStatus(status: Status): boolean {
        return !!(this.status & status);
    }

    public isIgnored(): boolean {
        return this.ignored;
    }

    public ignore(): void {
        this.ignored = true;
    }
}
