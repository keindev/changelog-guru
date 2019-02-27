export default class Commit {
    private timestamp: number;
    private url: string;
    private message: string;
    private commentsCount: number;

    constructor(timestamp: number, message: string, url: string, commentsCount: number = 0) {
        this.timestamp = timestamp;
        this.message = message;
        this.url = url;
        this.commentsCount = commentsCount;
    }

    public isCommented(): boolean {
        return !!this.commentsCount;
    }
}
