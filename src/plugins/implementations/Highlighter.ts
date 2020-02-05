import Commit from '../../core/entities/Commit';
import Plugin, { IPluginConfig } from '../Plugin';

export default class Highlighter extends Plugin {
    private masks: RegExp[] = [];

    public async init(config: IPluginConfig): Promise<void> {
        const { masks, camelCase } = config as {
            camelCase?: boolean;
            masks?: string[];
        };

        this.masks = [];

        if (Array.isArray(masks)) this.masks.push(...masks.map(mask => new RegExp(mask, 'gi')));
        if (camelCase) this.masks.push(/[a-zA-Z]+[A-Z]+[a-z]+/g);
    }

    public async parse(commit: Commit): Promise<void> {
        const subject = commit.getSubject();
        let match: RegExpExecArray | null;

        this.masks.forEach(mask => {
            // eslint-disable-next-line no-cond-assign
            while ((match = mask.exec(subject)) !== null) {
                commit.addReplacement(match[0], match.index);
            }
        });
    }
}
