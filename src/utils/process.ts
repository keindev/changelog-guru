import logUpdate from 'log-update';
import Task, { Status } from './task';

class Process {
    public static SUCCESS: number = 0;
    public static ERROR: number = 1;

    private static instance: Process;

    private id: NodeJS.Timeout | undefined;
    private tasks: Task[] = [];
    private task: Task | undefined;

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public start() {
		if (!this.id) {
            this.id = setInterval(() => {
                this.render();
            }, 100);
        }
	}

	public end(code: number = Process.SUCCESS) {
		if (this.id) {
            clearInterval(this.id);
            this.id = undefined;
            this.render();
            logUpdate.done();
		}

        process.exit(code);

	}

    public addTask(text: string, status: Status = Status.Pending): Task {
        const task = new Task(text, status);

        if (this.task && this.task.isPending()) {
            this.task.add(task);
        } else {
            this.tasks.push(task);
            this.task = task;
        }

        if (status === Status.Failed) this.failTask();

        return task;
    }

    public completeTask() {
        const { task } = this;

        if (task) task.complete();

        this.task = undefined;
    }

    public skipTask() {
        const { task } = this;

        if (task) task.skip();

        this.task = undefined;
    }

    public failTask(error?: string) {
        const { task } = this;

        if (task) task.fail(error);

        this.end(Process.ERROR);
    }

    private render() {
        logUpdate(this.tasks.map((task: Task) => task.render()).join(Task.LINE_SEPARATOR));
    }
}

export const Instance = Process.Instance;
