import { Task } from 'tasktree-cli/lib/task';
import { PluginOption } from '../../config/config';
import { CommitPlugin } from '../commit-plugin';
import { Section, SectionPosition } from '../../entities/section';
import { Commit } from '../../entities/commit';
import Key from '../../utils/key';
import { PluginLintOptions } from '../../linter';

export interface SectionPluginOptions extends PluginOption {
    [key: string]: string[];
}

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

    public lint(options: PluginLintOptions, task: Task): void {
        const { type } = options;

        if (!Key.inMap(type, this.blocks)) task.error(`Commit type {bold ${type}} is not assigned with section`);
    }
}
