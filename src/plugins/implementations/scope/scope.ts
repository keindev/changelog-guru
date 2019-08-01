import { CommitPlugin } from '../../commit-plugin';
import { ScopePluginOptions } from './typings/types';
import { Commit } from '../../../entities/commit';
import Key from '../../../utils/key';

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
