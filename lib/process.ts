import chalk from 'chalk';

export default class Process {
    public static log(label: string, msg: string): void {
        const date = (): string => new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');

        console.log(chalk`{gray [${date()}]}: {bold ${label}} {greenBright ${msg}}`);
    }

    public static info(label: string, msg: string): void {
        console.log(chalk`{bold ${label}}: {greenBright ${msg}}`);
    }

    public static error(error: string, exit: boolean = true): void {
        console.error(chalk`{red ${error}}`);

        if (exit) {
            Process.exit();
        }
    }

    public static exit(): void {
        process.exit(1);
    }
}
