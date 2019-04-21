import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import { ConfigOptions } from '../entities/config';
import { Option } from '../utils/types';
import Key from '../utils/key';
import Section, { Position } from '../entities/section';

interface Config extends ConfigOptions {
    scopes: {
        only: boolean | undefined;
        list: Option;
    };
}

export default class ScopePlugin extends Plugin {
    private scopes: Map<string, Section> = new Map();
    private onlyConfigured: boolean = false;

    public async init(config: Config): Promise<void> {
        const { scopes } = config;

        if (typeof scopes === 'object') {
            const { only, list } = scopes;

            this.onlyConfigured = !!only;

            if (typeof list === 'object') {
                Object.keys(list).forEach((name: string): void => {
                    const title = list[name];

                    if (typeof title === 'string' && !this.scopes.has(name)) {
                        const key: string = Key.unify(name);

                        this.scopes.set(key, this.context.addSection(title, Position.Subgroup));
                    }
                });
            }
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const scope: string | undefined = commit.getScope();

        if (scope) {
            const { scopes, context, onlyConfigured } = this;
            let section = Key.inMap(scope, scopes);

            if (!onlyConfigured && !section) section = context.addSection(scope, Position.Subgroup);
            if (section) section.assign(commit);
        }
    }
}
