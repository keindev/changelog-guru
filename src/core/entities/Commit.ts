import { LookupManager } from 'string-lookup-manager';
import Entity, { Compare, Priority } from './Entity';
import Author from './Author';
import { ChangeLevel } from '../config/Config';
import Markdown from '../../utils/Markdown';

export enum CommitStatus {
    BreakingChanges = 1,
    Deprecated = 2,
    Important = 4,
    Default = 8,
}

export interface ICommitOptions {
    hash: string;
    timestamp: number;
    header: string;
    body?: string;
    url: string;
    author: Author;
}

// TODO: used???
export interface ISubjectSubstitution {
    index: number;
    substitution: string;
}

export default class Commit extends Entity {
    public static LINE_SEPARATOR = '\n';

    public readonly body: readonly string[];
    public readonly timestamp: number;
    public readonly url: string;
    public readonly author: Author;

    private subject = '';
    private scope: string | undefined;
    private type: string | undefined;
    private accents: Set<string> = new Set();
    private status = CommitStatus.Default;
    private replacements: LookupManager<{}> = new LookupManager<{}>();

    public constructor({ hash, timestamp, header, body, url, author }: ICommitOptions) {
        super(hash);

        this.timestamp = timestamp;
        this.body = body ? body.split(Commit.LINE_SEPARATOR).map((l): string => l.trim()) : [];
        this.url = url;
        this.author = author;

        const [type, scope, subject] = Commit.splitHeader(header);

        if (type) this.type = type.toLocaleLowerCase();
        if (scope) this.scope = scope;
        if (subject) this.subject = subject;
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

    public static splitHeader(text: string): [string | undefined, string | undefined, string | undefined] {
        const match = text.match(/^(?<type>[a-z ]+) {0,1}(\((?<scope>[a-z0-9& ,:-]+)\)){0,1}(?=:):(?<subject>[\S ]+)/i);
        let type: string | undefined;
        let scope: string | undefined;
        let subject: string | undefined;

        if (match) {
            const { groups } = match;

            if (groups) {
                if (groups.type) type = groups.type.trim();
                if (groups.scope) scope = groups.scope.trim();
                if (groups.subject) subject = groups.subject.trim();
            }
        }

        return [type, scope, subject];
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
        return this.replacements.replace(this.subject, item => Markdown.wrap(item.value));
    }

    public setSubject(subject: string): void {
        this.subject = subject;
    }

    public setStatus(status: CommitStatus): void {
        this.status |= status;

        if (this.hasStatus(CommitStatus.Deprecated)) this.setChangeLevel(ChangeLevel.Minor);
        if (this.hasStatus(CommitStatus.BreakingChanges)) this.setChangeLevel(ChangeLevel.Major);
    }

    public hasStatus(status: CommitStatus): boolean {
        return !!(this.status & status);
    }

    public addReplacement(value: string, position: number): void {
        this.replacements.add(value, position);
    }
}
