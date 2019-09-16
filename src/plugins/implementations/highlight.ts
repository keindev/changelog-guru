import { CommitPlugin } from '../commit-plugin';
import { Commit } from '../../entities/commit';
import { PluginOption } from '../../config/config';
import Markdown from '../../utils/markdown';

export enum MaskType {
    // Generics between tags - <React.Profiler>
    Generics = '<[^>]*>',
    // Words which start with $ symbol - $scopedSlots
    DollarSign = '(?<= |^)\\$[a-z0-9\\[\\]{}()]+',
    // Cli commands - -help or --help
    CliCommand = '((?<= )|^)-{1,2}[a-z0-9_-]+',
    // Words which have dash - vue-template-compiler
    DashSign = '(?<= |^)[a-z0-9]+-[a-z0-9-]+',
    // Words which have dot - this.$slots or ctx.slots()
    DotSign = '(?<= |^)[a-z0-9_$]+\\.[a-z0-9_$.-{}()\\[\\]]+',
}

export interface HighlightPluginOptions extends PluginOption {
    camelCase?: boolean;
    masks?: string[];
}

export default class HighlightPlugin extends CommitPlugin {
    private masks: RegExp[] = [];

    static addNewReplacement(newWord: string, posNewWord: number, replacements: Map<number, string>): void {
        const endPosNewWord = posNewWord + newWord.length;
        const deleteReplacements: number[] = [];
        let endPosReplacement = 0;
        let isNewWord = replacements.size === 0;

        replacements.forEach((replacement, posReplacement) => {
            endPosReplacement = posReplacement + replacement.length;
            isNewWord = endPosReplacement < posNewWord || endPosNewWord < posReplacement;

            if (!isNewWord && endPosReplacement < endPosNewWord && posReplacement > posNewWord) {
                isNewWord = true;
                deleteReplacements.push(posReplacement);
            }
        });

        deleteReplacements.forEach(value => replacements.has(value) && replacements.delete(value));

        if (isNewWord) replacements.set(posNewWord, newWord);
    }

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
        const { subject, isEscaped } = this.getHighlightSubject(commit.getSubject());

        if (isEscaped) commit.escape();
        commit.setSubject(subject);
    }

    private getHighlightSubject(subject: string): { subject: string; isEscaped: boolean } {
        const subjectResult: string[] = [];
        let isEscaped = false;

        if (subject.length > 0) {
            const replacements = this.getReplacements(subject);
            let posResult = 0;

            replacements.forEach((value: [number, string]) => {
                const [posReplacement, replacement] = value;
                const markdownReplacement = Markdown.wrap(replacement);

                subjectResult.push(subject.substr(posResult, posReplacement - posResult), markdownReplacement);
                posResult = posReplacement + replacement.length;
                isEscaped = true;
            });

            if (posResult < subject.length) subjectResult.push(subject.substr(posResult, subject.length));
        }

        return {
            subject: subjectResult.join(''),
            isEscaped,
        };
    }

    private getReplacements(subject: string): [number, string][] {
        const replacements: Map<number, string> = new Map();
        let match: RegExpExecArray | null;

        this.masks.forEach((mask: RegExp): void => {
            do {
                match = mask.exec(subject);

                if (match) {
                    const newWord = match[0];
                    const posNewWord = match.index;

                    HighlightPlugin.addNewReplacement(newWord, posNewWord, replacements);
                }
            } while (match && mask.lastIndex);
        });

        return [...replacements.entries()].sort((a, b) => a[0] - b[0]);
    }
}
