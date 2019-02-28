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

    /**

    @see https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines

    <type>(<scope>): <subject>
    [<flags>]
    <body>
    <footer>

    <type> - sections;
    <scope> - The scope should be the name of the system/module part affected;
    <subject> - The subject contains a succinct description of the change. (contains [#ISSUE])
    <flags> - !break !important & etc (TODO)
    <body>
    <footer> - task id, docs links:
        - task: #id, #id
        - docs: link (or id?)

    */


    public isCommented(): boolean {
        return !!this.commentsCount;
    }
}
