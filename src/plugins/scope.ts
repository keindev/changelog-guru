import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Section from '../entities/section';
import Entity from '../entities/entity';

interface ScopeConfig extends Config {
    scopes: { [key: string]: string } | undefined;
}

class ScopeModifier extends Entity {
    public readonly key: string;

    public constructor(key: string) {
        super();

        this.key = key;
    }
}

export default class ScopePlugin extends AbstractPlugin {
    private sections: Map<string, Section> = new Map();

    public constructor(config: ScopeConfig, state: State) {
        super(config, state);

        const { scopes } = config;

        if (typeof scopes === 'object') {
            Object.keys(scopes).forEach((type: string): void => {
                if (typeof scopes[type] === 'string') {
                    this.createSection(scopes[type]);
                }
            });
        }
    }

    public parse(commit: Commit): void {
        const scope: string = commit.getScope();

        if (scope.length) {
            this.addModifier(commit, new ScopeModifier(this.createSection(scope)));
        }
    }

    public async modify(commit: Commit, modifier?: Entity): Promise<void> {
        const { key } = modifier as ScopeModifier;
        const section: Section | undefined = this.sections.get(key);

        if (section) {
            this.state.sections.assign(section, commit);
        }
    }

    private createSection(scope: string): string {
        const { sections } = this;
        const key = scope.trim().toLowerCase();

        if (!sections.has(scope)) {
            const section: Section | undefined = this.state.sections.add(scope);

            if (section) {
                sections.set(key, section);
            }
        }

        return key;
    }
}
