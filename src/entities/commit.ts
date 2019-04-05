import Author from './author';
import Modifier from './modifier';
import Process from '../utils/process';

const debug = Process.getDebugger('entities:commit');

export default class Commit {
    public readonly header: string;
    public readonly body: string[];
    public readonly modifiers: Modifier[] = [];
    public readonly timestamp: number;
    public readonly url: string;
    public readonly sha: string;

    private author: Author;
    private types: string[] = [];
    private scope: string | undefined;
    private priority: number = 0;
    private breaking: boolean = false;
    private deprecated: boolean = false;
    private visible: boolean = true;

    public constructor(sha: string, timestamp: number, message: string, url: string, author: Author) {
        debug('create [Commit]: %s', sha);

        this.sha = sha;
        this.timestamp = timestamp;

        const lines = message.split('\n').map((line): string => line.trim());

        this.header = lines.shift() || '';
        this.body = lines;
        this.url = url;
        this.author = author;
        this.author.contribute();

        const match = this.header.match(/(?<types>[a-z, ]+) {0,1}(\((?<scope>[a-z,]+)\)){0,1}(?=:)/i);
        if (match && match.groups) {
            if (match.groups.types) {
                this.types = match.groups.types.split(',').map((type):string => type.trim());
            }

            if (match.groups.scope) {
                this.scope = match.groups.scope;
            }
        }
    }

    public getType(): string {
        return this.types[0] || '';
    }

    public getScope(): string {
        return this.scope || '';
    }

    public break(): void {
        this.breaking = true;
        this.increasePriority();
    }

    public deprecate(): void {
        this.deprecated = true;
        this.increasePriority();
    }

    public hide(): void {
        if (!this.isImportant()) {
            this.visible = false;
        }
    }

    public increasePriority(): void {
        this.priority++;
    }

    public isBreaking(): boolean {
        return this.breaking;
    }

    public isDeprecated(): boolean {
        return this.deprecated;
    }

    public isImportant(): boolean {
        return this.isBreaking() && this.isDeprecated();
    }

    public isVisible(): boolean {
        return this.visible
    }

    public isValid(): boolean {
        return !!this.header.length && !!this.types.length;
    }
}
