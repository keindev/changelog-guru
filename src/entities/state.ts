import * as semver from 'semver';
import path from 'path';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Process from '../utils/process';
import Key from '../utils/key';
import { Options } from '../io/config';
import Section, { SectionPosition } from './section';
import { Constructable, Importable } from '../utils/types';

export default class State {
    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private version: string = '1.0.0';

    public setVersion(version: string): void {
        if (!semver.valid(version)) Process.error('<version> is invalid (see https://semver.org/)');

        this.version = version;
    }

    public getVersion(): string {
        return this.version;
    }

    public addCommit(commit: Commit, author: Author): void {
        if (commit.isValid() && !this.commits.has(commit.sha)) {
            this.commits.set(commit.sha, commit);

            if (!this.authors.has(author.id)) {
                this.authors.set(author.id, author);
            }
        }
    }

    public getSection(title: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.title, title));
    }

    public createSection(title: string, position: SectionPosition = SectionPosition.Subgroup): Section {
        let section: Section | undefined = this.getSection(title);

        if (typeof section === 'undefined') {
            this.sections.push(section = new Section(title, position));
        }

        return section;
    }

    public async modify(plugins: string[], options: Options): Promise<void> {
        const commits: Commit[] = [...this.commits.values()];
        const classes: Importable<Plugin>[] = await Promise.all(plugins.map((name): Promise<Importable<Plugin>> => {
            return import(path.resolve(__dirname, '../plugins', `${name}.js`))
        }));

        await Promise.all(classes.map((pluginModule: Importable<Plugin>): Promise<void> => {
            return this.modifyWith(pluginModule.default, options, commits);
        }));
    }

    private async modifyWith(PluginClass: Constructable<Plugin>, options: Options, commits: Commit[]): Promise<void> {
        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin: Plugin = new PluginClass(this);

            if (plugin instanceof Plugin) {
                await plugin.init(options);
                await Promise.all(commits.map((commit: Commit): Promise<void> => plugin.parse(commit)));
            }
        }
    }
}
