import { Task } from 'tasktree-cli/lib/task';
import Section, { SectionPosition } from '../../core/entities/Section';
import Commit from '../../core/entities/Commit';
import Key from '../../utils/Key';
import Plugin, { IPluginLintOptions } from '../Plugin';
import { IPluginOption } from '../../core/config/Config';

export interface ISectionPluginOptions extends IPluginOption {
    [key: string]: string[];
}

export default class SectionPlugin extends Plugin {
    private blocks: Map<string, Section> = new Map();

    public async init(config: ISectionPluginOptions): Promise<void> {
        this.blocks = new Map();

        let section: Section | undefined;

        Object.entries(config).forEach(([name, types], index) => {
            if (Array.isArray(types)) {
                section = this.context.addSection(name, SectionPosition.Body);

                if (section) {
                    section.setOrder(index + 1);
                    types.forEach(type => {
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

    public lint(options: IPluginLintOptions, task: Task): void {
        const { type } = options;

        if (!Key.inMap(type, this.blocks)) task.error(`Commit type {bold ${type}} is not assigned with section`);
    }
}
