import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';
import Key from '../../utils/key';

export interface ScopeNames {
    [key: string]: string;
}

export interface ScopePluginOptions extends PluginOption {
    onlyPresented: boolean;
    names: ScopeNames;
}

export default class ScopePlugin extends CommitPlugin {
    private onlyPresented: boolean = false;
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

            scope.split(',').forEach((abbr): void => {
                accent = Key.inMap(abbr, this.names);

                if (accent || (!this.onlyPresented && abbr.length)) {
                    commit.addAccent((accent || abbr).trim());
                }
            });
        }
    }
}
