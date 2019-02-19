import chalk from 'chalk';

export enum Errors {
    REPOSITORY_IS_NOT_SPECIFIED =
};

export default class Utils {
    static log(label: string, msg: string) {
        const date = () => new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

        console.log(chalk`{gray [${date()}]}: {bold ${label}} {greenBright ${msg}}`);
    }

    static info(label: string, msg: string) {
        console.log(chalk`{bold ${label}}: {greenBright ${msg}}`);
    }

    static error(error: string, exit: boolean = true) {
        console.error(chalk`{red ${error}}`);

        exit && Utils.exit();
    }

    static exit() {
        process.exit(1);
    }
}
