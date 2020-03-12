import { Task } from 'tasktree-cli/lib/Task';
import Commit from '../core/entities/Commit';
import License from '../core/License';
import Section, { Position, Order } from '../core/entities/Section';
import { IChange, Dependency, Restriction } from '../core/Package';

export interface IContext {
    license: License | undefined;

    getChanges(type: Dependency | Restriction): IChange[] | undefined;
    addSection(title: string, position?: Position, order?: Order): Section | undefined;
    findSection(title: string): Section | undefined;
}

export interface IConfig {
    [key: string]: string | boolean | number | string[] | undefined | IConfig | IConfig[];
}

export interface ILintOptions {
    task: Task;
    header: string;
    body: string[];
    type: string;
    scope: string;
    subject: string;
}

export type IPlugin = {
    context: IContext;

    modify?: (task: Task) => void;
    parse?: (commit: Commit) => void;
    lint?: (options: ILintOptions) => void;
};

export default class Plugin implements IPlugin {
    context: IContext;

    constructor(config: IConfig, context: IContext) {
        this.context = context;
    }
}
