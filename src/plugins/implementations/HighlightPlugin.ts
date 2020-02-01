import Commit from '../../entities/Commit';
import { IPluginOption } from '../../config/Config';
import BasePlugin, { IParserPlugin } from '../BasePlugin';

export interface IHighlightPluginOptions extends IPluginOption {
    camelCase?: boolean;
    masks?: string[];
}

export default class HighlightPlugin extends BasePlugin<IParserPlugin> {
    private masks: RegExp[] = [];

    public async init(config: IHighlightPluginOptions): Promise<void> {
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
