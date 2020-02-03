import { Task } from 'tasktree-cli/lib/task';
import Commit from '../core/entities/Commit';
import License from '../core/package/License';
import PackageRule, { PackageRuleType } from '../core/package/rules/PackageRule';
import Section, { SectionPosition } from '../core/entities/Section';
import { IPluginOption } from '../core/config/Config';

export interface IPluginLintOptions {
    header: string;
    body: string[];
    type: string;
    scope: string;
    subject: string;
}

export interface IPluginContext {
    getLicense(): License | undefined;
    getPackageRule(type: PackageRuleType): PackageRule | undefined;
    addSection(title: string, position: SectionPosition): Section | undefined;
    findSection(title: string): Section | undefined;
}

export type IPlugin = {
    init: (config: IPluginOption) => Promise<void>;
    modify?: (task: Task) => Promise<void>;
    parse?: (commit: Commit, task: Task) => Promise<void>;
    lint?: (options: IPluginLintOptions, task: Task) => void;
};

export default abstract class Plugin implements IPlugin {
    protected context: IPluginContext;

    public constructor(context: IPluginContext) {
        this.context = context;
    }

    abstract async init(config: IPluginOption): Promise<void>;
}
