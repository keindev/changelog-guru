import { SemVer } from 'semver';
import Author from '../core/entities/Author';

export const header = (level: number): string => '#'.padStart(Math.min(6, Math.max(1, level)), '#');

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const title = (text: string, level = 1): string => `${header(level)} ${capitalize(text)}\n`;

export const strong = (text: string): string => `**${text}**`;

export const list = (text: string): string => `-   ${capitalize(text)}`;

export const link = (text: string, url: string): string => `[${text}](${url})`;

export const code = (text: string, lang = ''): string => `\`\`\`${lang} ${text} \`\`\``;

export const wrap = (text: SemVer | string | undefined): string => `\`${text}\``;

export const line = (): string => '---\n';

export const image = (text: string, url: string): string => `![${text}](${url})`;

export const imageLink = (text: string, img: string, url: string): string => link(image(text, img), url);

export const commitLink = (text: string, url: string): string => link(wrap(text), url);

export const authorLink = (author: Author): string => imageLink(author.name, author.avatar, author.url);

export const licenseLink = (license: string): string => link(license, `https://spdx.org/licenses/${license}.html`);

export const contributors = (links: string[]): string => [line(), title('Contributors'), ...links].join('\n');
