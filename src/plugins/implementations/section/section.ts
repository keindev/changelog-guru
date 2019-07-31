import { CommitPlugin } from '../../commit-plugin';
import { SectionPluginOptions } from './typings/types';
import { Section } from '../../../entities/section';
import { SectionPosition } from '../../../entities/typings/enums';
import Key from '../../../utils/key';
import { Commit } from '../../../entities/commit';

export default class SectionPlugin extends CommitPlugin {
    private blocks: Map<string, Section> = new Map();

    public async init(config: SectionPluginOptions): Promise<void> {
        this.blocks = new Map();

        let section: Section | undefined;

        Object.entries(config).forEach(([name, types], index): void => {
            if (Array.isArray(types)) {
                section = this.context.addSection(name, SectionPosition.Body);

                if (section) {
                    section.setOrder(index + 1);
                    types.forEach((type: string): void => {
                        this.blocks.set(Key.unify(type), section as Section);
                    });
                }
            }
        });
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
