import Commit from '../../core/entities/Commit';
import Plugin, { IPluginConfig } from '../Plugin';

export default class Highlighter extends Plugin {
    #masks: RegExp[] = [];

    async init(config: IPluginConfig): Promise<void> {
        const { masks, camelCase } = config as {
            camelCase?: boolean;
            masks?: string[];
        };

        this.#masks = [];

        if (Array.isArray(masks)) this.#masks.push(...masks.map(mask => new RegExp(mask, 'gi')));
        if (camelCase) this.#masks.push(/[a-zA-Z]+[A-Z]+[a-z]+/g);
    }

    async parse(commit: Commit): Promise<void> {
        let match: RegExpExecArray | null;

        this.#masks.forEach(mask => {
            while ((match = mask.exec(commit.subject)) !== null) {
                commit.addReplacement(match[0], match.index);
            }
        });
    }
}
