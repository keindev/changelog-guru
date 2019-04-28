import logUpdate from 'log-update';
import Task, { Status } from './task';

export default class Process {
    private static instance: Process;

    private id: NodeJS.Timeout | undefined;
    private tasks: Task[] = [];
    private stack: Task[] = [];

    public static getInstance(): Process {
        if (!Process.instance) {
            Process.instance = new Process();
        }

        return Process.instance;
    }

    public start(): void {
        if (!this.id) {
            this.id = setInterval((): void => {
                this.render();
            }, 100);
        }
    }

    public end(success: boolean): void {
        if (this.id) {
            clearInterval(this.id);
            this.id = undefined;
            this.render();
            logUpdate.done();
        }

        process.exit(Number(success));
    }

    public addTask(text: string, status: Status = Status.Pending): void {
        const { stack } = this;
        const task: Task | undefined = stack[stack.length - 1];
        const subtask = new Task(text, status);

        if (task && task.isPending()) {
            task.add(subtask);
            stack.push(subtask);
        } else {
            this.tasks.push(subtask);
        }
    }

    public addSubTask(text: string, skipped: boolean = false): void {
        const { stack } = this;
        const status = skipped ? Status.Skipped : Status.Completed;
        const task: Task | undefined = stack[stack.length - 1];

        if (task) task.add(new Task(text, status));
    }

    public completeTask(): void {
        const task: Task | undefined = this.stack.pop();

        if (task) task.complete();
    }

    public skipTask(): void {
        const task: Task | undefined = this.stack.pop();

        if (task) task.skip();
    }

    public failTask(error?: string): void {
        const task: Task | undefined = this.stack.pop();

        if (task) task.fail(error);

        this.end(false);
    }

    public failTaskIf(condition: boolean, error?: string): void {
        if (condition) this.failTask(error);
    }

    private render(): void {
        logUpdate(this.tasks.map((task: Task): string => task.render()).join(Task.LINE_SEPARATOR));
    }
}
