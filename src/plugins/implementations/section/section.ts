import { CommitPlugin } from '../../commit-plugin';
import { SectionPluginOptions } from './typings/types';
import { Section } from '../../../entities/section';
import { SectionPosition } from '../../../entities/typings/enums';
import Key from '../../../utils/key';
import { Commit } from '../../../entities/commit';

export default class SectionPlugin extends CommitPlugin {
    private blocks: Map<string, Section> = new Map();

    public async init(config: SectionPluginOptions): Promise<void> {
        const { section: sections } = config;

        if (Array.isArray(sections)) {
            sections.forEach((block): void => {
                if (block) {
                    let section: Section | undefined;

                    Object.entries(block).forEach(([name, types]): void => {
                        if (Array.isArray(types)) {
                            section = this.context.addSection(name, SectionPosition.Body);

                            if (section) {
                                types.forEach((type: string): void => {
                                    this.blocks.set(Key.unify(type), section as Section);
                                });
                            }
                        }
                    });
                }
            });
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const type = commit.getTypeName();

        if (type) {
            const section = Key.inMap(type, this.blocks);

            if (section) {
                section.add(commit);
            }
        }
    }
}
