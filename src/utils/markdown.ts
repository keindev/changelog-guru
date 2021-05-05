import { SemVer } from 'semver';

const MIN_HEADER_LEVEL = 1;
const MAX_HEADER_LEVEL = 6;

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
export const code = (text: string, lang = ''): string => `\`\`\`${lang} ${text} \`\`\``;
export const commit = (text: string, url: string): string => link(wrap(text), url);
export const contributors = (links: string[]): string => [line(), title('Contributors'), links.join(' ')].join('\n');
export const details = (text: string): string => `<details>\n${text}\n</details>\n`;
export const header = (level: number): string => '#'.padStart(headerLevel(level), '#');
export const headerLevel = (level: number): number => Math.min(MAX_HEADER_LEVEL, Math.max(MIN_HEADER_LEVEL, level));
export const image = (text: string, img: string, url: string): string => link(`![${text}](${img})`, url);
export const license = (type: string): string => link(type, `https://spdx.org/licenses/${type}.html`);
export const line = (): string => '---\n';
export const link = (text: string, url: string): string => `[${text}](${url})`;
export const list = (text: string): string => `- ${capitalize(text)}`;
export const strong = (text: string): string => `**${text}**`;
export const summary = (text: string): string => `<summary>${text}</summary>\n`;
export const title = (text: string, level = 1): string => `${header(level)} ${capitalize(text)}\n`;
export const wrap = (text?: SemVer | string): string => `\`${text}\``;

export default {
  capitalize,
  code,
  commit,
  contributors,
  details,
  header,
  headerLevel,
  image,
  license,
  line,
  link,
  list,
  strong,
  summary,
  title,
  wrap,
};
