import { Task } from 'tasktree-cli/lib/task';
import Commit from '../../core/entities/Commit';
import { IPluginOption } from '../../core/config/Config';
import Key from '../../utils/Key';
import Plugin, { IPluginLintOptions } from '../Plugin';

export interface IScopeNames {
    [key: string]: string;
}

export interface IScopePluginOptions extends IPluginOption {
    onlyPresented: boolean;
    names: IScopeNames;
}

export default class ScopePlugin extends Plugin {
    public static SEPARATOR = ',';
    public static MIN_NAME_LENGTH = 2;

    private onlyPresented = false;
    private names: Map<string, string> = new Map();

    public async init(config: IScopePluginOptions): Promise<void> {
        this.onlyPresented = !!config.onlyPresented;
        this.names = new Map(
            Object.entries(config.names).map(([abbr, name]): [string, string] => [Key.unify(abbr), name])
        );
    }

    public async parse(commit: Commit): Promise<void> {
        const scope = commit.getScope();

        if (scope) {
            let accent: string | undefined;

            scope.split(ScopePlugin.SEPARATOR).forEach(name => {
                accent = Key.inMap(name, this.names);

                if (accent || (!this.onlyPresented && name.length)) {
                    commit.addAccent((accent || name).trim());
                }
            });
        }
    }

    public lint(options: IPluginLintOptions, task: Task): void {
        const { scope } = options;

        if (scope) {
            scope.split(ScopePlugin.SEPARATOR).forEach(name => {
                if (name.length < ScopePlugin.MIN_NAME_LENGTH) task.error(`Scope name {bold ${name}} is too short`);
                if (this.onlyPresented && !Key.inMap(name, this.names)) {
                    task.error(`Scope name {bold ${name}} is not available`);
                }
            });
        }
    }
}
