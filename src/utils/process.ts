import chalk from 'chalk';
// eslint-disable-next-line import/no-duplicates
import * as Debug from "debug";
// eslint-disable-next-line import/no-duplicates
import debug from "debug";

export default class Process {
    public static EXIT_CODE_ERROR: number = 1;
    public static EXIT_CODE_SUCCES: number = 0;
    public static DEBUG_NAMESPACE: string = 'changelog';
    public static DEBUG_NAMESPACE_LENGTH: number = 15;

    public static log(label: string, msg: string): void {
        const date = (): string => new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');

        // eslint-disable-next-line no-console
        console.log(chalk`{whiteBright [${date()}]}: {bold ${label}} {greenBright ${msg}}`);
    }

    public static info(label: string, msg: string): void {
        // eslint-disable-next-line no-console
        console.log(chalk`{bold ${label}}: {greenBright ${msg}}`);
    }

    public static warn(label: string): void {
        // eslint-disable-next-line no-console
        console.log(chalk`${chalk.hex('#FF8800').bold('warning')}: ${label}`);
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

    public static getDebugger(context: string): Debug.Debugger {
        return debug([Process.DEBUG_NAMESPACE, context.padEnd(Process.DEBUG_NAMESPACE_LENGTH, '.')].join(':'));
    }

    public static exit(code: number = Process.EXIT_CODE_ERROR): void {
        process.exit(code);
    }
}
