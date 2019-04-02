import Commit from '../entities/commit';
import AbstractPlugin from '../entities/plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Modifier from '../entities/modifier';

interface SectionConfig extends Config {
    sections: { [key: string]: string[] }[] | undefined;
}

export class SectionModifier implements Modifier {
    public readonly index: number;

    public constructor(index: number) {
        this.index = index;
    }
}

export default class Section extends AbstractPlugin {
    private titles: string[] = [];
    private types: Map<string, number> = new Map();

    public constructor(config: SectionConfig) {
        super(config);

        if (Array.isArray(config.sections)) {
            config.sections.forEach((section) => {
                Object.keys(section).forEach((name: string) => {
                    section[name].forEach((type: string) => {
                        if (!this.types.has(type)) {
                            this.types.set(type, this.titles.push(name) - 1);
                        }
                    });
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
