import path from 'path';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Key from '../utils/key';
import { ConfigOptions } from './config';
import Section, { Position } from './section';
import { Constructable, Importable } from '../utils/types';

export interface Context {
    getSection(title: string): Section | undefined;
    addSection(title: string, position: Position): Section;
}

export default class State implements Context {
    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];

    public addCommit(commit: Commit, author: Author): void {
        const { commits, authors } = this;

        if (!commits.has(commit.sha)) {
            commits.set(commit.sha, commit);

            if (!authors.has(author.id)) authors.set(author.id, author);
        }
    }

    public getSection(title: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.title, title));
    }

    public addSection(title: string, position: Position = Position.Subgroup): Section {
        let section: Section | undefined = this.getSection(title);

        if (typeof section === 'undefined') {
            this.sections.push(section = new Section(title, position));
        }

        return section;
    }

    public async modify(plugins: string[], options: ConfigOptions): Promise<void> {
        const commits: Commit[] = [...this.commits.values()];
        const classes: Importable<Plugin, Context>[] = await Promise.all(
            plugins.map((name): Promise<Importable<Plugin, Context>> => {
                return import(path.resolve(__dirname, '../plugins', `${name}.js`))
            })
        );

        await Promise.all(classes.map((pluginModule: Importable<Plugin, Context>): Promise<void> => {
            return this.modifyWith(pluginModule.default, options, commits);
        }));
    }

    private async modifyWith(PluginClass: Constructable<Plugin, Context>,
        options: ConfigOptions, commits: Commit[]): Promise<void> {
        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin: Plugin = new PluginClass(this);

            if (plugin instanceof Plugin) {
                await plugin.init(options);
                await Promise.all(commits.map((commit: Commit): Promise<void> => plugin.parse(commit)));
            }
        }
    }
}
