import { Task } from 'tasktree-cli/lib/task';
import Section, { Position } from '../../core/entities/Section';
import Commit from '../../core/entities/Commit';
import { unify, findSame } from '../../utils/Text';
import Plugin, { IPluginLintOptions, IPluginConfig } from '../Plugin';

export default class SectionLinker extends Plugin {
    #blocks = new Map<string, Section>();

    constructor(config: IPluginConfig, context?: IPluginContext) {
        if (this.context) {
            Object.entries(config).forEach(([name, types], order) => {
                if (Array.isArray(types) && types.length) {
                    const section = this.context!.addSection(name, Position.Body, order);

                    if (section) {
                        (types as string[]).forEach(type => {
                            this.#blocks.set(unify(type), section);
                        });
                    }
                }
            });
        }
    }

    async parse(commit: Commit): Promise<void> {
        if (commit.type) {
            const name = findSame(commit.type, [...this.#blocks.keys()]);

            if (name && this.#blocks.has(name)) this.#blocks.get(name)!.add(commit);
        }
    }

    lint({ type }: IPluginLintOptions, task: Task): void {
        if (!findSame(type, [...this.#blocks.keys()])) {
            task.error(`Commit type {bold ${type}} is not assigned with section`);
        }
    }
}
