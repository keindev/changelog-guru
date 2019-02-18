import * as fs from 'fs';
import chalk from 'chalk';
import findupSync from 'findup-sync';

export enum Errors {
    GIT_HEAD_IS_NOT_EXIST = '.git/HEAD does not exist',
    GIT_HEAD_SHA_NOT_FOUND = '.git/HEAD ref(s) SHA not found',
    PACKAGE_NOT_FOUND = 'package.json not found',
    CONFIG_NOT_FOUND = '<config> options is not an existing filename',
    TOKEN_IS_NOT_PROVIDED = '<token> options must be provided',
    REPOSITORY_IS_NOT_SPECIFIED = 'project repository not specified',
    PACKAGE_VERSION_IS_INVALID = 'package version is invalid (see https://semver.org/)'
};

export default class Utils {
    static getSHA(cwd: string): string {
        const filepath: string = findupSync('.git/HEAD', { cwd: cwd || process.cwd() });
        let sha: string = "";

        if (fs.existsSync(filepath)) {
            const buffer: Buffer = fs.readFileSync(filepath);
            const match: RegExpExecArray | null = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

            if (match) {
                sha = match[1];
            } else {
                Utils.error(Errors.GIT_HEAD_SHA_NOT_FOUND);
            }
        } else {
            Utils.error(Errors.GIT_HEAD_IS_NOT_EXIST);
        }

        return sha;
    }

    static log(label: string, msg: string) {
        const date = () => new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        console.log(chalk`{gray [${date()}]}: {bold ${label}} {greenBright ${msg}}`);
    }

    static info(label: string, msg: string) {
        console.log(chalk`{bold ${label}}: {greenBright ${msg}}`);
    }

    static error(error: Errors) {
        console.error(chalk`{red ${error}}`)

        process.exit(1);
    }
}
