import { Task } from 'tasktree-cli/lib/task';
import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';
import Key from '../../utils/key';
import { PluginLintOptions } from '../../linter';

export interface ScopeNames {
    [key: string]: string;
}

export interface ScopePluginOptions extends PluginOption {
    onlyPresented: boolean;
    names: ScopeNames;
}

export default class ScopePlugin extends CommitPlugin {
    public static SEPARATOR = ',';
    public static MIN_NAME_LENGTH = 2;

    private onlyPresented = false;
    private names: Map<string, string> = new Map();

    public async init(config: ScopePluginOptions): Promise<void> {
        this.onlyPresented = !!config.onlyPresented;
        this.names = new Map(
            Object.entries(config.names).map(([abbr, name]): [string, string] => [Key.unify(abbr), name])
        );
    }

    public async parse(commit: Commit): Promise<void> {
        const scope = commit.getScope();

        if (scope) {
            let accent: string | undefined;

            scope.split(ScopePlugin.SEPARATOR).forEach((name): void => {
                accent = Key.inMap(name, this.names);

                if (accent || (!this.onlyPresented && name.length)) {
                    commit.addAccent((accent || name).trim());
                }
            });
        }
    }

    public lint(options: PluginLintOptions, task: Task): void {
        const { scope } = options;

        if (scope) {
            scope.split(ScopePlugin.SEPARATOR).forEach((name): void => {
                if (name.length < ScopePlugin.MIN_NAME_LENGTH) task.error(`Scope name {bold ${name}} is too short`);
                if (this.onlyPresented && !Key.inMap(name, this.names)) {
                    task.error(`Scope name {bold ${name}} is not available`);
                }
            });
        }
    }
}
