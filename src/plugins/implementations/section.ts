import { Commit } from '../entities/commit';
import { CommitPlugin } from '../entities/plugin';
import { ConfigurationOptions } from '../entities/configuration';
import { Option, OptionValue } from '../utils/types';
import { Section, Position } from '../entities/section';
import Key from '../utils/key';

export interface SectionConfiguration extends ConfigurationOptions {
    sections: Option;
}

export default class SectionPlugin extends CommitPlugin {
    private blocks: Map<string, Section> = new Map();

    public async init(config: SectionConfiguration): Promise<void> {
        const { sections } = config;

        if (Array.isArray(sections)) {
            sections.forEach((block): void => {
                if (typeof block === 'object') {
                    Object.keys(block).forEach((name: string): void => {
                        const types: OptionValue = block[name];

                        if (Array.isArray(types)) {
                            const section = this.context.addSection(name, Position.Body);

                            if (section) {
                                types.forEach((type: string): void => {
                                    this.blocks.set(Key.unify(type), section);
                                });
                            }
                        }
                    });
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const type = commit.getType();

        if (type) {
            const section = Key.inMap(type, this.blocks);

            if (section) {
                section.add(commit);
            }
        }
    }
}
