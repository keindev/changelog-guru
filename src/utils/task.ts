import chalk from 'chalk';
import logSymbols from 'log-symbols';
import figures from 'figures';
import elegantSpinner from 'elegant-spinner';
import indentString from 'indent-string';

const LINE_INDENT: { indent: string } = { indent: '  ' };
const SYMBOL_MAIN_TASK: string = chalk.yellow(figures.pointer);
const SYMBOL_SKIPPED: string = chalk.yellow(figures.arrowDown);
const SYMBOL_EMPTY: string = '';

export enum Status {
    Pending,
    Completed,
    Failed,
    Skipped,
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

    public add(task: Task) {
        this.subtasks.push(task);
    }

    public subtask(text: string, status: Status = Status.Completed) {
        if (status === Status.Completed || status === Status.Skipped) this.add(new Task(text, status));
    }

    public complete() {
        if (!this.subtasks.length) {
            this.update(Status.Completed);
        } else {
            this.fail('Subtasks is not complete.')
        }
    }

    public skip() {
        this.update(Status.Skipped);
    }

    public fail(error?: string) {
        this.update(Status.Failed, error ? `${this.text}: ${error}` : this.text);
    }

    public isPending(): boolean {
        return this.status === Status.Pending;
    }

    public render(level: number = 0): string {
        const skipped = this.status === Status.Skipped ? ` ${chalk.dim('[skipped]')}` : SYMBOL_EMPTY;
        const prefix = level ? `${chalk.gray(figures.arrowRight)} ` : SYMBOL_EMPTY;
        const output = [];

        output.push(indentString(`${prefix}${this.getSymbol()} ${this.text}${skipped}`, level, LINE_INDENT));
    	output.push(...this.subtasks.map((task: Task): string => task.render(level + 1)));

    	return output.join(Task.LINE_SEPARATOR);
    }

    private getSymbol(): string {
        const spinner = elegantSpinner();
        let symbol: string;

        switch (this.status) {
            case Status.Skipped: symbol = SYMBOL_SKIPPED; break;
            case Status.Completed: symbol = logSymbols.success; break;
            case Status.Failed: symbol = logSymbols.error; break;
            default: symbol = this.subtasks.length ? SYMBOL_MAIN_TASK : chalk.yellow(spinner()); break;
        }

        return symbol;
    }

    private update(status: Status, text?: string) {
        if (text) this.text = text;

        this.status = status;
    }
}
