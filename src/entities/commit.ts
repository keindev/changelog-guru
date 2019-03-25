import Author from './author';
import Process from '../utils/process';

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
    private header: string;
    private body: string[];
    private author: Author;

    constructor(timestamp: number, message: string, url: string, author: Author) {
        this.timestamp = timestamp;
        this.body = message.split('\n');
        this.header = this.body.shift() || "";
        this.url = url;
        this.author = author;
        this.author.contribute();
    }

    /**
        @see https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines

        -----------------------commit-----------------------
        <type>(<scope>): <subject>
        [<flags>]
        <body>

        <footer>
        ----------------------------------------------------
    */
}
