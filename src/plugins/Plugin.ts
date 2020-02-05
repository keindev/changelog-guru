import { Task } from 'tasktree-cli/lib/task';
import Commit from '../core/entities/Commit';
import License from '../core/package/License';
import PackageRule, { PackageRuleType } from '../core/package/rules/PackageRule';
import Section, { SectionPosition, SectionOrder } from '../core/entities/Section';

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
    addSection(title: string, position?: SectionPosition, order?: SectionOrder): Section | undefined;
    findSection(title: string): Section | undefined;
}

export interface IPluginConfig {
    [key: string]: string | boolean | number | string[] | undefined | IPluginConfig | IPluginConfig[];
}

export interface IPlugin {
    init: (config: IPluginConfig) => Promise<void>;
    modify?: (task: Task) => Promise<void>;
    parse?: (commit: Commit) => Promise<void>;
    lint?: (options: IPluginLintOptions, task: Task) => void;
}

export default abstract class Plugin implements IPlugin {
    protected context?: IPluginContext;

    constructor(context?: IPluginContext) {
        this.context = context;
    }

    abstract async init(config: IPluginConfig): Promise<void>;
}
