import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';
import Markdown from '../../utils/markdown';

export enum MaskType {
    // Generics between tags
    Generics = '<[^>]*>',
    // Words which start with $ symbol
    DollarSign = '\\$\\S*',
    // Cli commands
    CliCommand = '(?<=\\s)-{1,2}\\w\\S*',
}

export interface HighlightPluginOptions extends PluginOption {
    camelCase?: boolean;
    masks?: string[];
}

export default class HighlightPlugin extends CommitPlugin {
    private masks: RegExp[] = [];

    public async init(config: HighlightPluginOptions): Promise<void> {
        const { masks } = config;
        const camelCase = !!config.camelCase;

        this.masks = Object.values(MaskType).map(mask => new RegExp(mask, 'gi'));

        if (Array.isArray(masks)) {
            masks.forEach(mask => {
                this.masks.push(new RegExp(mask, 'gi'));
            });
        }

        if (camelCase) {
            this.masks.push(new RegExp('[a-z]\\w*[A-Z]\\S*', 'g'));
        }
    }

    public async parse(commit: Commit): Promise<void> {
        const subject = this.getSubjectFrom(commit);

        commit.setSubject(subject);
    }

    private getSubjectFrom(commit: Commit): string {
        let escape = false;
        let subject = commit.getSubject();

        if (subject) {
            this.masks.forEach((mask: RegExp): void => {
                subject = subject.replace(mask, (substring): string => {
                    escape = true;

                    return Markdown.wrap(substring);
                });
            });
        }
        if (escape) commit.escape();

        return subject;
    }
}
