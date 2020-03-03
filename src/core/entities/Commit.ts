import { LookupManager } from 'string-lookup-manager';
import Entity, { Compare, Priority, ChangeLevel } from './Entity';
import Author from './Author';
import { wrap } from '../../utils/Markdown';

export enum Status {
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

export const splitHeader = (text: string): [string, string, string] => {
    const match = text.match(/^(?<type>[a-z ]+) {0,1}(\((?<scope>[a-z0-9& ,:-]+)\)){0,1}(?=:):(?<subject>[\S ]+)/i);
    let type = '';
    let scope = '';
    let subject = '';

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

export default class Commit extends Entity {
    readonly body: readonly string[] = [];
    readonly timestamp: number;
    readonly url: string;
    readonly author: Author;
    readonly scope?: string;

    #subject = '';
    #type?: string;
    #accents = new Set<string>();
    #status = Status.Default;
    #replacements = new LookupManager<{}>();

    constructor({ hash, timestamp, header, body, url, author }: ICommitOptions) {
        super(hash);

        this.timestamp = timestamp;
        this.url = url;
        this.author = author;

        const [type, scope, subject] = splitHeader(header);

        if (type) this.#type = type.toLocaleLowerCase();
        if (scope) this.scope = scope;
        if (subject) this.#subject = subject;
        if (body) this.body = body.split('\n').map(line => line.trim());
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

    get accents(): string[] {
        return [...this.#accents.values()];
    }

    get type(): string {
        return this.#type ?? '';
    }

    get priority(): Priority {
        let priority = super.priority;

        if (this.hasStatus(Status.BreakingChanges)) priority += Priority.High;
        if (this.hasStatus(Status.Deprecated)) priority += Priority.Medium;
        if (this.hasStatus(Status.Important)) priority += Priority.Low;

        return priority;
    }

    get subject(): string {
        return this.#replacements.replace(this.#subject, item => wrap(item.value));
    }

    set subject(subject: string) {
        this.#subject = subject;
    }

    addAccent(text: string): void {
        this.#accents.add(text);
    }

    addReplacement(value: string, position: number): void {
        this.#replacements.add(value, position);
    }

    addStatus(status: Status): void {
        this.#status = status;

        if (this.hasStatus(Status.Deprecated)) this.level = ChangeLevel.Minor;
        if (this.hasStatus(Status.BreakingChanges)) this.level = ChangeLevel.Major;
    }

    hasStatus(status: Status): boolean {
        return !!(this.#status & status);
    }
}
