import { SemVer } from 'semver';
import Author from '../core/entities/Author';

export default class Markdown {
    static DEFAULT_HEADER_LEVEL = 1;
    static LINE_SEPARATOR = '\n';
    static ITEM_SEPARATOR = ', ';
    static WORD_SEPARATOR = ' ';
    static EMPTY_SEPARATOR = '';

    static title(text: string, level = Markdown.DEFAULT_HEADER_LEVEL): string {
        return [
            '#'.padStart(Math.max(Markdown.DEFAULT_HEADER_LEVEL, level), '#'),
            Markdown.WORD_SEPARATOR,
            Markdown.capitalize(text),
            Markdown.LINE_SEPARATOR,
        ].join(Markdown.EMPTY_SEPARATOR);
    }

    static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    static bold(text: string): string {
        return `**${text}**`;
    }

    static listItem(text: string): string {
        return `-   ${Markdown.capitalize(text)}`;
    }

    static link(text: string, url: string): string {
        return `[${text}](${url})`;
    }

    static code(text: string, lang = ''): string {
        return `\`\`\`${lang} ${text} \`\`\``;
    }

    static wrap(text: SemVer | string | undefined): string {
        return `\`${text}\``;
    }

    static line(): string {
        return `---${Markdown.LINE_SEPARATOR}`;
    }

    static image(text: string, url: string): string {
        return `![${text}](${url})`;
    }

    static imageLink(text: string, img: string, url: string): string {
        return Markdown.link(Markdown.image(text, img), url);
    }

    static commitLink(text: string, url: string): string {
        return Markdown.link(Markdown.wrap(text), url);
    }

    static authorLink(author: Author): string {
        return Markdown.imageLink(author.name, author.getAvatar(), author.url);
    }
}
