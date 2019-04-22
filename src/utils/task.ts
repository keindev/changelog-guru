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

    public constructor(text: string) {
        this.text = text;
        this.status = Status.Pending;
    }

    public add(text: string): Task {
        const task = new Task(text);

        this.subtasks.push(task);

        return task;
    }

    public complete(text: string) {
        if (!this.subtasks.length) {
            this.text = text;
            this.status = Status.Completed;
        } else {
            this.fail('Subtasks is not complete.')
        }
    }

    public skip(text: string) {
        this.text = text;
        this.status = Status.Skipped;
    }

    public fail(text: string) {
        this.text = text;
        this.status = Status.Failed;
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
}
