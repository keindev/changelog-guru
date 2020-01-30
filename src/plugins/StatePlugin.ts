import { Task } from 'tasktree-cli/lib/task';
import BasePlugin from './BasePlugin';

export default abstract class StatePlugin extends BasePlugin {
    public abstract async modify(task: Task): Promise<void>;
}
