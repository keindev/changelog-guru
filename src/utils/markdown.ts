export default class Markdown {
    public static DEFAULT_HEADER_LEVEL = 2;

    public static title(text: string, level: number = Markdown.DEFAULT_HEADER_LEVEL): string {
        return `${'#'.padStart(Math.max(Markdown.DEFAULT_HEADER_LEVEL, level), '#')} ${Markdown.capitalize(text)}`;
    }

    public static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    public static bold(text: string): string {
        return `**${text}** `;
    }

    public static list(items: string[]): string {
        return items.map((item): string => `- ${Markdown.capitalize(item)}`).join('\n');
    }

    public static link(text: string, url: string): string {
        return `[${text}](${url})`;
    }

    public static code(text: string, lang: string = ''): string {
        return `\`\`\`${lang} ${text} \`\`\``;
    }

    public static line(): string {
        return '---';
    }

    public static image(text: string, url: string): string {
        return `![${text}](${url})`;
    }
}