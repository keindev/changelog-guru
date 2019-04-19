import Key from '../utils/key';

export default class Commit {
    private static EXPRESSION: RegExp = /(?<types>[a-z, ]+) {0,1}(\((?<scope>[a-z,/:-]+)\)){0,1}(?=:)/i;

    public readonly header: string;
    public readonly body: ReadonlyArray<string>;
    public readonly timestamp: number;
    public readonly url: string;
    public readonly sha: string;
    public readonly author: string;

    private types: string[] = [];
    private scope: string | undefined;
    private breaked: boolean = false;
    private deprecated: boolean = false;
    private important: boolean = false;
    private visible: boolean = true;

    public constructor(sha: string, timestamp: number, message: string, url: string, author: string) {
        const lines = message.split('\n').map((line): string => line.trim());

        this.sha = sha;
        this.timestamp = timestamp;
        this.header = (lines.shift() || '').trim();
        this.body = lines;
        this.url = url;
        this.author = author;

        const match = this.header.match(Commit.EXPRESSION);
        if (match && match.groups) {
            const { groups: { types, scope } } = match;

            if (typeof types === 'string' && types.length) {
                this.types = types.split(',').map((type): string => Key.unify(type));
            }

            if (typeof scope === 'string') {
                this.scope = scope;
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
        this.breaked = true;
        this.show();
    }

    public deprecate(): void {
        this.deprecated = true;
        this.show();
    }

    public setImportant(): void {
        this.important = true;
        this.show();
    }

    public hide(): void {
        if (!this.isImportant()) {
            this.visible = false;
        }
    }

    public show(): void {
        this.visible = true;
    }

    public isBreaking(): boolean {
        return this.breaked;
    }

    public isDeprecated(): boolean {
        return this.deprecated;
    }

    public isImportant(): boolean {
        return this.important || (this.isBreaking() && this.isDeprecated());
    }

    public isVisible(): boolean {
        return this.visible
    }

    public isValid(): boolean {
        return !!this.header.length && !!this.types.length;
    }
}
