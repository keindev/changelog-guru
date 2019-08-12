import { Compare, Priority } from '../typings/enums';
import { Entity } from './entity';
import { Author } from './author';
import { ChangeLevel } from '../config/config';

export enum CommitStatus {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
}

export interface CommitOptions {
    timestamp: number;
    header: string;
    body?: string;
    url: string;
    author: Author;
}

export class Commit extends Entity {
    public static LINE_SEPARATOR = '\n';

    public readonly subject: string = '';
    public readonly body: readonly string[];
    public readonly timestamp: number;
    public readonly url: string;
    public readonly author: Author;

    private scope: string | undefined;
    private type: string | undefined;
    private accents: Set<string> = new Set();
    private status = CommitStatus.Default;

    public constructor(hash: string, options: CommitOptions) {
        super(hash);

        this.timestamp = options.timestamp;
        this.body = options.body ? options.body.split(Commit.LINE_SEPARATOR).map((l): string => l.trim()) : [];
        this.url = options.url;
        this.author = options.author;

        const [type, scope, subject] = Commit.splitHeader(options.header);

        if (type) this.type = type.trim();
        if (scope) this.scope = scope.trim();
        if (subject) this.subject = subject.trim();
    }

    public static compare(a: Commit, b: Commit): Compare {
        const x = a.getScope();
        const y = b.getScope();
        let result = super.compare(a, b);

        if (x && !y) result--;
        if (!x && y) result++;
        if (x && y) result = x.localeCompare(y);
        if (result === Compare.Equal) result = a.timestamp - b.timestamp;

        return Math.min(Math.max(result, Compare.Less), Compare.More);
    }

    public static splitHeader(text: string): string[] {
        const match = text.match(/^(?<type>[a-z ]+) {0,1}(\((?<scope>[a-z0-9& ,:-]+)\)){0,1}(?=:):(?<subject>[\S ]+)/i);
        let result: string[] = [];

        if (match) {
            const { groups } = match;

            if (groups) {
                const { type, scope, subject } = groups;

                result = [type, scope, subject];
            }
        }

        return result;
    }

    public getAccents(): string[] {
        return [...this.accents.values()];
    }

    public addAccent(text: string): void {
        this.accents.add(text);
    }

    public getTypeName(): string | undefined {
        return this.type;
    }

    public getPriority(): Priority {
        let priority = super.getPriority();

        if (this.hasStatus(CommitStatus.BreakingChanges)) priority += Priority.High;
        if (this.hasStatus(CommitStatus.Deprecated)) priority += Priority.Medium;
        if (this.hasStatus(CommitStatus.Important)) priority += Priority.Low;

        return priority;
    }

    public getScope(): string | undefined {
        return this.scope;
    }

    public getSubject(): string {
        return this.subject;
    }

    public setStatus(status: CommitStatus): void {
        this.status = this.status | status;

        if (this.hasStatus(CommitStatus.Deprecated)) this.setChangeLevel(ChangeLevel.Minor);
        if (this.hasStatus(CommitStatus.BreakingChanges)) this.setChangeLevel(ChangeLevel.Major);
    }

    public hasStatus(status: CommitStatus): boolean {
        return !!(this.status & status);
    }
}
