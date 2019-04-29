import chalk from 'chalk';
import logSymbols from 'log-symbols';
import figures from 'figures';
import elegantSpinner from 'elegant-spinner';
import indentString from 'indent-string';
import Process from './process';

const LINE_INDENT: { indent: string } = { indent: '  ' };
const SYMBOL_MAIN_TASK: string = chalk.yellow(figures.pointer);
const SYMBOL_SKIPPED: string = chalk.yellow(figures.arrowDown);
const SYMBOL_EMPTY = '';

export enum Status {
    Pending,
    Completed,
    Failed,
    Skipped,
    Informed
}

export default class Task {
    public static LINE_SEPARATOR: string = '\n';

    private text: string;
    private status: Status;
    private subtasks: Task[] = [];

    public constructor(text: string, status: Status = Status.Pending) {
        this.text = text;
        this.status = status;
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

    public info(text: string): void {
        this.add(text, Status.Informed);
    }

    public skip(text?: string): void {
        this.update(Status.Skipped, text);
    }

    public fail(error?: string): void {
        this.update(Status.Failed, error ? `${this.text}: ${chalk.redBright(error)}` : this.text);
        Process.getInstance().end(false);
    }

    public isPending(): boolean {
        return this.status === Status.Pending;
    }

    public render(level: number = 0): string {
        const skipped = this.status === Status.Skipped ? ` ${chalk.dim('[skipped]')}` : SYMBOL_EMPTY;
        const prefix = level ? `${chalk.dim(figures.arrowRight)} ` : SYMBOL_EMPTY;
        const output = [];

        output.push(indentString(`${prefix}${this.getSymbol()} ${this.text}${skipped}`, level, LINE_INDENT));
        output.push(...this.subtasks.map((task: Task): string => task.render(level + 1)));

        const text = output.join(Task.LINE_SEPARATOR);

        return level ? chalk.dim(text) : text;
    }

    private getSymbol(): string {
        const spinner = elegantSpinner();
        let symbol: string;

        switch (this.status) {
            case Status.Skipped:
                symbol = SYMBOL_SKIPPED;
                break;
            case Status.Informed:
                symbol = logSymbols.info;
                break;
            case Status.Completed:
                symbol = logSymbols.success;
                break;
            case Status.Failed:
                symbol = logSymbols.error;
                break;
            default:
                symbol = this.subtasks.length ? SYMBOL_MAIN_TASK : chalk.yellow(spinner());
                break;
        }

        return symbol;
    }

    private update(status: Status, text?: string): void {
        if (text) this.text = text;

        this.status = status;
    }
}
