import Commit from '../entities/commit';
import AbstractPlugin from '../entities/abstract-plugin';
import State from '../middleware/state';
import Config from '../io/config';
import Entity from '../entities/entity';
import Section, { SectionPosition } from '../entities/section';

interface SectionConfig extends Config {
    sections: { [key: string]: string[] }[] | undefined;
}

export default class SectionPlugin extends AbstractPlugin {
    private sections: Map<string, number> = new Map();

    public constructor(config: SectionConfig, state: State) {
        super(config, state);

        if (Array.isArray(config.sections)) {
            config.sections.forEach((block): void => {
                Object.keys(block).forEach((name: string): void => {
                    if (Array.isArray(block[name])) {
                        const index: number = state.sections.create(name, SectionPosition.Body);

                        block[name].forEach((type: string): void => {
                            const key: string = Section.trim(type);

                            this.debug('-- %s', type);
                            this.sections.set(key, index);
                        });
                    }
                });
            });
        }
    }

    public parse(commit: Commit): void {
        const type: string = commit.getType();
        const key: string = Section.trim(type);

        if (key.length) {
            const { sections, state } = this;
            let index: number | undefined = sections.get(key);

            if (typeof index === 'undefined') {
                index = state.sections.create(sections, SectionPosition.Subgroup);
                sections.set(key, index);
            }

            state.sections.assign(index, commit.sha);
        }
    }
}
