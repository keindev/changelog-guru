import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';

export interface HighlightPluginOptions extends PluginOption {
    camelCase?: boolean;
    masks?: string[];
}

export default class HighlightPlugin extends CommitPlugin {
    private masks: RegExp[] = [];

    public async init(config: HighlightPluginOptions): Promise<void> {
        const { masks } = config;

        this.masks = [];

        if (Array.isArray(masks)) {
            this.masks.push(...masks.map(mask => new RegExp(mask, 'gi')));
        }

        if (config.camelCase) {
            this.masks.push(/[a-zA-Z]+[A-Z]+[a-z]+/g);
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const subject = commit.getSubject();
        let match: RegExpExecArray | null;

        this.masks.forEach(mask => {
            // TODO: replace to matchAll after v12 Active LTS Start (2019-10-22)
            // eslint-disable-next-line no-cond-assign
            while ((match = mask.exec(subject)) !== null) {
                commit.addReplacement(match[0], match.index);
            }
        });
    }
}
