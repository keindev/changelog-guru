import * as Debug from "debug";
import Process from '../utils/process';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type mixed = string | number | Record<string, any>;

export default class Entity {
    public readonly name: string;

    private debugger: Debug.Debugger;

    public constructor(id?: string) {
        this.name = this.constructor.name;
        this.debugger = Process.getDebugger(this.name);

        if (typeof id === 'string') {
            this.debug('create: %s', id);
        } else {
            this.debug('create...');
        }
    }

    public debug(msg: string, ...args: mixed[]): void {
        this.debugger(msg, ...args);
    }
}
