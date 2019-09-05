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
            let match: RegExpExecArray | null;
            const replacements: Map<number, string> = new Map();

            this.masks.forEach((mask: RegExp): void => {
                do {
                    match = mask.exec(subject);

                    if (match) {
                        const str = match[0];
                        const startPos = match.index;
                        const endPos = startPos + str.length;
                        const deleteReplacement: number[] = [];
                        let addWord = replacements.size === 0;

                        replacements.forEach((value: string, key: number) => {
                            const startPosReplacement = key;
                            const endPosReplacement = startPosReplacement + value.length;

                            if (value.length > str.length) {
                                if (startPosReplacement > endPos || endPosReplacement < startPos) {
                                    addWord = true;
                                }
                            }

                            if (value.length < str.length) {
                                if (
                                    str.indexOf(value) > -1 &&
                                    (startPosReplacement < startPos && endPosReplacement > endPos)
                                ) {
                                    addWord = true;
                                    deleteReplacement.push(key);
                                }

                                if (
                                    str.indexOf(value) === -1 ||
                                    (startPosReplacement > startPos && endPosReplacement < endPos)
                                ) {
                                    addWord = true;
                                }
                            }

                            if (value.length === str.length && (str.indexOf(value) === -1 || key !== startPos)) {
                                addWord = true;
                            }
                        });

                        deleteReplacement.forEach(value => replacements.has(value) && replacements.delete(value));

                        if (addWord) {
                            replacements.set(startPos, str);
                        }
                    }
                } while (match && mask.lastIndex);
            });

            const subjectResult: string[] = [];
            const replacementsSorted = [...replacements.entries()].sort((a, b) => a[0] - b[0]);

            let startPosition = 0;

            replacementsSorted.forEach((value: [number, string]) => {
                const [position, str] = value;
                const replacement = Markdown.wrap(str);

                if (startPosition !== position - startPosition)
                    subjectResult.push(subject.substr(startPosition, position - startPosition));

                subjectResult.push(replacement);
                startPosition = position + str.length;
                escape = true;
            });

            if (startPosition < subject.length) subjectResult.push(subject.substr(startPosition, subject.length));

            subject = subjectResult.join('');
        }
        if (escape) commit.escape();

        return subject;
    }
}
