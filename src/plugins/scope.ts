import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Section, { SectionPosition } from '../entities/section';
import Entity from '../entities/entity';

interface ScopeConfig extends Config {
    scopes: { [key: string]: string } | undefined;
}

export default class ScopePlugin extends AbstractPlugin {
    private scopes: Map<string, number> = new Map();

    public constructor(config: ScopeConfig, state: State) {
        super(config, state);

        const { scopes } = config;

        if (typeof scopes === 'object') {
            Object.keys(scopes).forEach((key: string): void => {
                if (typeof scopes[key] === 'string') {
                    this.scopes.set(Section.trim(key), state.sections.create(key, SectionPosition.Subgroup));
                }
            });
        }
    }

    public parse(commit: Commit): void {
        const scope: string = commit.getScope();
        const key: string = Section.trim(scope);

        if (key.length) {
            const { scopes, state } = this;
            let index: number | undefined = scopes.get(key);

            if (typeof index === 'undefined') {
                index = state.sections.create(scope, SectionPosition.Subgroup);
                scopes.set(key, index);
            }

            state.sections.assign(index, commit.sha);
        }
    }
}
