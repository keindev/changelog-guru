import { Task } from 'tasktree-cli/lib/task';
import { StatePlugin } from '../entities/plugin';
import { ConfigurationOptions } from '../entities/configuration';
import { Section, Position } from '../entities/section';
import { Message } from '../entities/message';
import { Writer } from '../io/writer';
import { Level } from '../utils/enums';
import Markdown from '../utils/markdown';

export interface Configuration extends ConfigurationOptions {
    attention: {
        title: string;
    };
}

export default class AttentionPlugin extends StatePlugin {
    private section: Section | undefined;

    public async init(config: Configuration): Promise<void> {
        const { attention } = config;

        if (attention && attention.title) {
            this.section = this.context.addSection(attention.title, Position.Header, true);
        }
    }

    public async modify(task: Task): Promise<void> {
        const { section } = this;

        if (section) {
            const license = this.context.getLicense();

            if (license && license.isChanged) {
                let text: string;

                if (license.prev) {
                    task.warn(`License changed from ${license.prev} to ${license.id}.`);
                    text = [
                        `License changed from ${Markdown.wrap(license.prev)} to ${Markdown.wrap(license.id)}.`,
                        `You can check it in ${Markdown.link(
                            'the full list of SPDX license IDs.',
                            'https://spdx.org/licenses/'
                        )}`,
                    ].join(Writer.WORD_SEPARATOR);
                } else {
                    text = `Source code now under ${Markdown.wrap(license.id)} license.`;
                    task.log(text);
                }

                section.add(new Message(text, Level.Major));
            }
        }
    }
}
