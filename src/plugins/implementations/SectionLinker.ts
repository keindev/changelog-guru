import { Task } from 'tasktree-cli/lib/task';
import Section, { SectionPosition } from '../../core/entities/Section';
import Commit from '../../core/entities/Commit';
import { unify, inMap } from '../../utils/Text';
import Plugin, { IPluginLintOptions, IPluginConfig } from '../Plugin';

export default class SectionLinker extends Plugin {
    private blocks = new Map<string, Section>();

    async init(config: IPluginConfig): Promise<void> {
        if (this.context) {
            const { context, blocks } = this;

            Object.entries(config).forEach(([name, types], order) => {
                if (Array.isArray(types)) {
                    const section = context.addSection(name, SectionPosition.Body, order);

                    if (section) {
                        (types as string[]).forEach(type => {
                            blocks.set(unify(type), section);
                        });
                    }
                }
            });
        }
    }

    async parse(commit: Commit): Promise<void> {
        if (commit.typeName) {
            const section = inMap(commit.typeName, this.blocks);

            if (section) section.add(commit);
        }
    }

    lint(options: IPluginLintOptions, task: Task): void {
        const { type } = options;

        if (!inMap(type, this.blocks)) task.error(`Commit type {bold ${type}} is not assigned with section`);
    }
}
