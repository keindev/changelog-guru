import { SemVer } from 'semver';
import { Author } from '../entities/author';

export default class Markdown {
    public static DEFAULT_HEADER_LEVEL = 1;
    public static LINE_SEPARATOR = '\n';
    public static ITEM_SEPARATOR = ', ';
    public static WORD_SEPARATOR = ' ';
    public static EMPTY_SEPARATOR = '';

    public static title(text: string, level: number = Markdown.DEFAULT_HEADER_LEVEL): string {
        return [
            '#'.padStart(Math.max(Markdown.DEFAULT_HEADER_LEVEL, level), '#'),
            Markdown.WORD_SEPARATOR,
            Markdown.capitalize(text),
            Markdown.LINE_SEPARATOR,
        ].join(Markdown.EMPTY_SEPARATOR);
    }

    public static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    public static bold(text: string): string {
        return `**${text}**`;
    }

    public static listItem(text: string): string {
        return `-   ${Markdown.capitalize(text)}`;
    }

    public static link(text: string, url: string): string {
        return `[${text}](${url})`;
    }

    public static code(text: string, lang = ''): string {
        return `\`\`\`${lang} ${text} \`\`\``;
    }

    public static wrap(text: SemVer | string | undefined): string {
        return `\`${text}\``;
    }

    public static line(): string {
        return `---${Markdown.LINE_SEPARATOR}`;
    }

    public static image(text: string, url: string): string {
        return `![${text}](${url})`;
    }

    public static imageLink(text: string, img: string, url: string): string {
        return Markdown.link(Markdown.image(text, img), url);
    }

    public static commitLink(text: string, url: string): string {
        return Markdown.link(Markdown.wrap(text), url);
    }

    public static authorLink(author: Author): string {
        return Markdown.imageLink(author.getName(), author.getAvatar(), author.url);
    }

    public static escape(text: string): string {
        return text.replace(/ +(?= )/g, Markdown.EMPTY_SEPARATOR).replace(/([\]\\/[^$|`!_#><~{}()*+?.-])/g, '\\$1');
    }
}
