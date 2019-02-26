import chalk from 'chalk';

export default class Process {
    public static EXIT_CODE_ERROR: number = 1;
    public static EXIT_CODE_SUCCES: number = 0;

    public static log(label: string, msg: string): void {
        const date = (): string => new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');

        // eslint-disable-next-line no-console
        console.log(chalk`{whiteBright [${date()}]}: {bold ${label}} {greenBright ${msg}}`);
    }

    public static info(label: string, msg: string): void {
        // eslint-disable-next-line no-console
        console.log(chalk`{bold ${label}}: {greenBright ${msg}}`);
    }

    public static error(error: string, exit: boolean = true): void {
        // eslint-disable-next-line no-console
        console.error(chalk`{red ${error}}`);

        if (exit) {
            Process.exit();
        }
    }

    public static getVersion(): string {
        let version = '';

        if (typeof process.env.npm_package_version === 'string') {
            version = process.env.npm_package_version;
        }

        return version;
    }

    public static exit(code: number = Process.EXIT_CODE_ERROR): void {
        process.exit(code);
    }
}
