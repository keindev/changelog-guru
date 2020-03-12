import { license, wrap } from '../utils/Markdown';

export default class License {
    readonly current: string;
    readonly previous?: string;
    readonly isChanged: boolean;

    constructor(current: string, previous?: string) {
        this.current = current;
        this.previous = previous;
        this.isChanged = !previous || !!current.localeCompare(previous);
    }

    get message(): string {
        return this.previous
            ? `License changed from ${license(this.previous)} to ${license(this.current)}.`
            : `Source code now under ${wrap(this.current)} license.`;
    }
}
