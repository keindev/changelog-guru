import chalk from 'chalk';
import logSymbols from 'log-symbols';
import figures from 'figures';
import elegantSpinner from 'elegant-spinner';
import indentString from 'indent-string';
import Process from './process';

const spinner = elegantSpinner();

export enum Status {
    Pending,
    Completed,
    Failed,
    Skipped
}

export default class Task {
    public static LINE_SEPARATOR: string = '\n';
    public static LINE_INDENT: { indent: string } = { indent: '  ' };
    public static SYMBOL_GROUP: string = chalk.yellow(figures.pointer);
    public static SYMBOL_SUCCESS: string = logSymbols.success;
    public static SYMBOL_SKIPPED: string = chalk.yellow(figures.arrowDown);
    public static SYMBOL_ERROR: string = logSymbols.error;
    public static SYMBOL_WARNING: string = logSymbols.warning;
    public static SYMBOL_INFO: string = logSymbols.info;
    public static SYMBOL_PREFIX: string = `${chalk.dim(figures.arrowRight)} `;

    public static SYMBOL_EMPTY = '';

    private text: string;
    private status: Status;
    private subtasks: Task[] = [];
    private logs: string[] = [];
    private warnings: string[] = [];

    public constructor(text: string, status: Status = Status.Pending) {
        this.text = text;
        this.status = status;
    }

    private static renderList(list: string[], symbol: string, level: number): string[] {
        return list.map((text: string): string => indentString(`${symbol} ${text}`, level + 1, Task.LINE_INDENT));
    }

    public add(text: string, status: Status = Status.Pending): Task {
        const task: Task = new Task(text, status);

        this.subtasks.push(task);

        return task;
    }

    public complete(text?: string): void {
        if (!this.subtasks.filter((task): boolean => task.isPending()).length) {
            this.update(Status.Completed, text);
        } else {
            this.fail('Subtasks is not complete.');
        }
    }

    public skip(text?: string): void {
        this.update(Status.Skipped, text);
    }

    public fail(error?: string): void {
        this.update(Status.Failed, this.getError(error));
        Process.getInstance().end(false);
    }

    public log(text: string): void {
        if (text) this.logs.push(text);
    }

    public warn(text: string): void {
        if (text) this.warnings.push(text);
    }

    public isPending(): boolean {
        return this.status === Status.Pending;
    }

    public getActive(): Task {
        const { subtasks } = this;
        const subtask: Task | undefined = subtasks[subtasks.length - 1];
        let task: Task = this;

        if (subtask && subtask.isPending()) {
            task = subtask.getActive();
        }

        return task;
    }

    public render(level: number = 0): string {
        const skipped = this.status === Status.Skipped ? ` ${chalk.dim('[skipped]')}` : Task.SYMBOL_EMPTY;
        const prefix = level ? Task.SYMBOL_PREFIX : Task.SYMBOL_EMPTY;
        const text = [
            indentString(`${prefix}${this.getSymbol()} ${this.text}${skipped}`, level, Task.LINE_INDENT),
            ...Task.renderList(this.warnings, Task.SYMBOL_WARNING, level),
            ...Task.renderList(this.logs, Task.SYMBOL_INFO, level),
            ...this.subtasks.map((task: Task): string => task.render(level + 1))
        ].join(Task.LINE_SEPARATOR);

        return level ? chalk.dim(text) : text;
    }

    private getSymbol(): string {
        let symbol: string;

        switch (this.status) {
            case Status.Skipped:
                symbol = Task.SYMBOL_SKIPPED;
                break;
            case Status.Completed:
                symbol = Task.SYMBOL_SUCCESS;
                break;
            case Status.Failed:
                symbol = Task.SYMBOL_ERROR;
                break;
            default:
                symbol = this.subtasks.length ? Task.SYMBOL_GROUP : chalk.yellow(spinner());
                break;
        }

        return symbol;
    }

    private getError(error?: string): string {
        return error ? `${this.text}: ${chalk.redBright(error)}` : this.text;
    }

    private update(status: Status, text?: string): void {
        if (this.isPending()) {
            if (text) this.text = text;

            this.status = status;
        } else {
            this.text = this.getError(
                `Trying to change the status of a completed task (${chalk.bold(this.status.toString())})`
            );
            this.status = Status.Failed;
        }
    }
}
