import logUpdate from 'log-update';
import Task from './task';

export default class Process {
    private static instance: Process;

    private id: NodeJS.Timeout | undefined;
    private tasks: Task[] = [];

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

    public task(text: string): Task {
        const { tasks } = this;
        // TODO: recursive find last active task
        let task: Task | undefined = tasks[tasks.length - 1];

        if (task && task.isPending()) {
            task = task.add(text);
        } else {
            tasks.push((task = new Task(text)));
        }

        return task;
    }

    private render(): void {
        logUpdate(this.tasks.map((task: Task): string => task.render()).join(Task.LINE_SEPARATOR));
    }
}
