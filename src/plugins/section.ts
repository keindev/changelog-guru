import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';
import Section, { SectionBlock } from '../entities/section';

interface SectionConfig extends Config {
    sections: { [key: string]: string[] }[] | undefined;
}

class SectionModifier extends Entity {
    public readonly type: string;

    public constructor(type: string) {
        super();

        this.type = type;
    }
}

export default class SectionPlugin extends AbstractPlugin {
    private sections: Map<string, Section> = new Map();

    public constructor(config: SectionConfig, state: State) {
        super(config, state);

        if (Array.isArray(config.sections)) {
            config.sections.forEach((block, index): void => {
                Object.keys(block).forEach((name: string): void => {
                    if (Array.isArray(block[name])) {
                        const section: Section | undefined = new Section(name, index, SectionBlock.Body);

                        if (section) {
                            block[name].forEach((type: string): void => {
                                const key: string = type.trim().toLowerCase();

                                this.debug('-- %s', type);
                                this.sections.set(key, section);
                            });
                        }
                    }
                });
            });
        }
    }

    public parse(commit: Commit): void {
        const type: string = commit.getType();

        if (type.length && this.sections.has(type)) {
            this.addModifier(commit, new SectionModifier(type));
        }
    }

    public async modify(commit: Commit, modifier?: Entity): Promise<void> {
        const { type } = modifier as SectionModifier;
        const { state: { sections } } = this;
        const section: Section | undefined = this.sections.get(type);

        if (section) sections.assign(section, commit);
    }
}
