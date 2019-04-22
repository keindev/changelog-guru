import logUpdate from 'log-update';
import Task from './task';

const tasks: Task[] = [];
let intervalId: NodeJS.Timeout | undefined;
let activeTaskIndex: number = 0;

export default class Process {
    public static EXIT_CODE_ERROR: number = 1;
    public static EXIT_CODE_SUCCES: number = 0;

    public static addTask(text: string): Task {
        const task = new Task(text);

        activeTaskIndex = tasks.push(task);

        return task;
    }

    public static addSubtask(text: string): Task | undefined {
        const task: Task | undefined = Process.getActiveTask();
        let subtask: Task | undefined;

        if (task) subtask = task.add(text);

        return subtask;
    }

    public static getActiveTask(): Task | undefined {
        return tasks[activeTaskIndex - 1];
    }

    public static start() {
		if (!intervalId) {
            intervalId = setInterval(() => {
                logUpdate(tasks.map((task: Task) => task.render()).join(Task.LINE_SEPARATOR));
    		}, 100);
		}
	}

	public static end() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = undefined;
            logUpdate.done();
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
        if (code === Process.EXIT_CODE_ERROR) Process.end();

        process.exit(code);
    }
}
