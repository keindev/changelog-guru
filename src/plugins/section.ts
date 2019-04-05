import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Modifier from '../entities/modifier';

interface SectionConfig extends Config {
    sections: { [key: string]: string[] }[] | undefined;
}

class SectionModifier extends Modifier {
    public readonly index: number;

    public constructor(index: number) {
        super();

        this.index = index;
    }
}

export default class Section extends AbstractPlugin {
    private titles: string[] = [];
    private types: Map<string, number> = new Map();

    public constructor(config: SectionConfig) {
        super(config);

        if (Array.isArray(config.sections)) {
            config.sections.forEach((section): void => {
                Object.keys(section).forEach((name: string): void => {
                    if (Array.isArray(section[name])) {
                        section[name].forEach((type: string): void => {
                            if (!this.types.has(type)) {
                                this.types.set(type, this.titles.push(name) - 1);
                            }
                        });
                    }
                });
            });
        }
    }

    public parse(commit: Commit): void {
        const type: string = commit.getType();
        const { types } = this;

        if (type.length && types.has(type)) {
            this.addModifier(commit, new SectionModifier(types.get(type) as number));
        }
    }

    public async modify(state: State, commit: Commit, modifier?: Modifier): Promise<void> {
        const { index } = modifier as SectionModifier;

        state.group(this.titles[index], commit);
    }
}
