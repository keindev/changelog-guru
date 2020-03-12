import Commit from '../../core/entities/Commit';
import Plugin, { IConfig, IContext } from '../Plugin';

export default class Highlighter extends Plugin {
    #masks: RegExp[] = [];

    constructor(config: IConfig, context: IContext) {
        super(config, context);

        const { masks, camelCase } = config as {
            camelCase?: boolean;
            masks?: string[];
        };

        this.#masks = [];

        if (Array.isArray(masks)) this.#masks.push(...masks.map(mask => new RegExp(mask, 'gi')));
        if (camelCase) this.#masks.push(/[a-zA-Z]+[A-Z]+[a-z]+/g);
    }

    parse(commit: Commit): void {
        let match: RegExpExecArray | null;

        this.#masks.forEach(mask => {
            while ((match = mask.exec(commit.subject)) !== null) {
                commit.addReplacement(match[0], match.index);
            }
        });
    }
}
