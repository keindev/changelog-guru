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
            this.masks.push(/[a-z]\w*[A-Z]\S*/g);
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const subject = commit.getSubject();
        let match: RegExpExecArray | null;

        // FIXME: rewrite to while ... do
        this.masks.forEach(mask => {
            do {
                match = mask.exec(subject);

                if (match) {
                    commit.addReplacement(match[0], match.index);
                }
            } while (match && mask.lastIndex);
        });
    }
}
