import { ReposListCommitsResponseItemCommit } from '@octokit/rest';

/*
const REGEXP_TYPE_AND_SCOPE: string = "(?<type>[\\w, ]+) {0,1}(\\((?<scope>[\\w,]+)\\)){0,1}(?=:)";
const REGEXP_SUBJECT: string = "(?<=:).*";
const REGEXP_SUBJECT_TASK: string = "(?<=#)\\w+";
const REGEXP_FLAG: string = "![\w]+";

const footerTypes = [
    task,
    docs,
    info,
    design
]
*/

export default class Commit {
    private timestamp: number;
    private url: string;
    private message: string;
    private commentsCount: number;
    private weight: number = 0;

    constructor(commit: ReposListCommitsResponseItemCommit, url: string) {
        this.timestamp = new Date(commit.author.date).getTime();
        this.message = commit.message;
        this.url = url;
        this.commentsCount = commit.comment_count; // TODO: increace weight?
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
        - docs: link (or id?) for links use [<LINK>] tpl

    */



    public isCommented(): boolean {
        return !!this.commentsCount;
    }
}
