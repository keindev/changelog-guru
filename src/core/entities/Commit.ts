import { LookupManager } from 'string-lookup-manager';
import Entity, { Compare, Priority } from './Entity';
import Author from './Author';
import { ChangeLevel } from '../Config';
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

export default class Commit extends Entity {
    readonly body: readonly string[] = [];
    readonly timestamp: number;
    readonly url: string;
    readonly author: Author;
    readonly scope?: string;

    private subject = '';
    private type?: string;
    private accents = new Set<string>();
    private status = CommitStatus.Default;
    private replacements = new LookupManager<{}>();

    constructor({ hash, timestamp, header, body, url, author }: ICommitOptions) {
        super(hash);

        this.timestamp = timestamp;
        this.url = url;
        this.author = author;

        const [type, scope, subject] = Commit.splitHeader(header);

        if (type) this.type = type.toLocaleLowerCase();
        if (scope) this.scope = scope;
        if (subject) this.subject = subject;
        if (body) this.body = body.split(Markdown.LINE_SEPARATOR).map(line => line.trim());
    }

    static compare(a: Commit, b: Commit): Compare {
        const { scope: x } = a;
        const { scope: y } = b;
        let result = super.compare(a, b);

        if (x && !y) result--;
        if (!x && y) result++;
        if (x && y) result = x.localeCompare(y);
        if (result === Compare.Equal) result = a.timestamp - b.timestamp;

        return Math.min(Math.max(result, Compare.Less), Compare.More);
    }

    static splitHeader(text: string): [string | undefined, string | undefined, string | undefined] {
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

    get accents(): string[] {
        return [...this.accents.values()];
    }

    get typeName(): string | undefined {
        return this.type;
    }

    get priority(): Priority {
        let priority = super.priority;

        if (this.hasStatus(CommitStatus.BreakingChanges)) priority += Priority.High;
        if (this.hasStatus(CommitStatus.Deprecated)) priority += Priority.Medium;
        if (this.hasStatus(CommitStatus.Important)) priority += Priority.Low;

        return priority;
    }

    get subject(): string {
        return this.replacements.replace(this.subject, item => Markdown.wrap(item.value));
    }

    set subject(subject: string): void {
        this.subject = subject;
    }

    set status(status: CommitStatus): void {
        this.status = status;

        if (this.hasStatus(CommitStatus.Deprecated)) this.changeLevel = ChangeLevel.Minor;
        if (this.hasStatus(CommitStatus.BreakingChanges)) this.changeLevel = ChangeLevel.Major;
    }

    addAccent(text: string): void {
        this.accents.add(text);
    }

    hasStatus(status: CommitStatus): boolean {
        return !!(this.status & status);
    }

    addReplacement(value: string, position: number): void {
        this.replacements.add(value, position);
    }
}
