import { Task } from 'tasktree-cli/lib/task';
import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';
import Markdown from '../../utils/markdown';
import { PluginLintOptions } from '../../linter';

export enum MaskType {
    // Generics between tags
    Generics = '<[^>]*>',
    // Words which start with $ symbol
    DollarSign = '\\$\\S*',
    // Cli commands
    CliCommand = '-{1,2}\\S*',
}

export interface HighlightPluginOptions extends PluginOption {
    camelCase?: boolean;
    masks?: string[];
}

export default class HighlightPlugin extends CommitPlugin {
    private camelCase = true;
    private masks: string[] = [];

    public async init(config: HighlightPluginOptions): Promise<void> {
        this.camelCase = !!config.camelCase;
        this.masks = Object.values(MaskType);
        if (Array.isArray(config.masks) && config.masks.length > 0) this.masks.push(...config.masks);
    }

    public async parse(commit: Commit): Promise<void> {
        const subject = this.getSubjectFrom(commit);
        commit.setSubject(subject);
    }

    public lint(options: PluginLintOptions, task: Task): void {
        this.masks.forEach(mask => {
            let isValid = true;
            try {
                RegExp(mask);
            } catch (e) {
                isValid = false;
            }
            if (!isValid) task.error(`Mask {bold ${mask}} is not valid`);
        });
    }

    private getSubjectFrom(commit: Commit): string {
        let escape = false;
        let subject = commit.getSubject();

        if (subject) {
            this.masks.forEach((mask: string): void => {
                const expression = new RegExp(mask, 'gi');
                subject = subject.replace(expression, (substring): string => {
                    escape = true;
                    return Markdown.code(substring.trim());
                });
            });
            if (this.camelCase) {
                const expression = new RegExp('[a-z]\\w*[A-Z]\\S*', 'g');
                subject = subject.replace(expression, (substring): string => {
                    escape = true;
                    return Markdown.code(substring.trim());
                });
            }
        }
        if (escape) commit.escape();
        return subject;
    }
}
