import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import Config, { ConfigOption, ConfigOptionValue } from '../io/config';
import Key from '../utils/key';
import { SectionPosition } from '../entities/section';

interface SectionConfig extends Config {
    sections: ConfigOption;
}

export default class SectionPlugin extends Plugin {
    private blocks: Map<string, string> = new Map();

    public async load(config: SectionConfig) {
        const { sections } = config;

        if (Array.isArray(sections)) {
            sections.forEach((block): void => {
                if (typeof block === 'object') {
                    Object.keys(block).forEach((name: string): void => {
                        const types: ConfigOptionValue = block[name];

                        if (Array.isArray(types)) {
                            this.createSection(name, SectionPosition.Body);

                            types.forEach((type: string): void => {
                                this.blocks.set(Key.unify(type), name);
                            });
                        }
                    });
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const type: string = commit.getType();

        if (type.length) {
            const name: string | undefined = Key.inMap(type, this.blocks);

            if (typeof name === 'string') this.assignSection(name, commit);
        }
    }
}
