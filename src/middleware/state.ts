import * as semver from 'semver';
import path from 'path';
import Author from '../entities/author';
import Commit from '../entities/commit';
import Plugin from '../entities/plugin';
import Context from '../entities/context';
import Config, { Options } from '../io/config';
import Process from '../utils/process';
import { Constructable, Importable } from '../utils/types';

export default class State {
    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private relations: Map<number, Set<string>> = new Map();
    private version: string = '1.0.0';
    private context: Context;

    public constructor() {
        this.context = new Context(this);
    }

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

    public async modify(plugins: string[], options: Options): Promise<void> {
        const commits: Commit[] = [...this.commits.values()];
        const classes: Importable<Plugin>[] = await Promise.all(plugins.map((name) => {
            return import(path.resolve(__dirname, '../plugins', `${name}.js`))
        }));

        await Promise.all(classes.map((pluginModule: Importable<Plugin>) => {
            return this.modifyWith(pluginModule.default, options, commits);
        }));
    }

    private async modifyWith(PluginClass: Constructable<Plugin>, options: Options, commits: Commit[]): Promise<void> {
        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin: Plugin = new PluginClass();

            if (plugin instanceof Plugin) {
                await plugin.load(options, this.context);
                await Promise.all(commits.map((commit: Commit) => plugin.parse(commit)));
            }
        }
    }































/*

    public async load(config: Config): Promise<void> {
        const promises: Promise<void>[] = [];

        plugins.map((plugin): Plugin<Plugin> => plugin.default).forEach((PluginClass): void => {

        });

        await Promise.all(promises);
    }
*/

    public create(title: string, position: SectionPosition = SectionPosition.Subgroup): number {
        const { sections } = this;
        const key = Key.unify(title);
        let index: number = sections.findIndex((section) => Key.isEqual(section.key, key));

        if (!~index) {
            index = sections.push(new Section(title, position)) - 1;
        }

        return index;
    }

    public assign(index: number, sha: string) {
        const { relations } = this;
        let relation: Set<string> | undefined = relations.get(index);

        if (typeof relation === 'undefined') {
            relation = new Set();
        }

        relation.add(sha);
    }

    public build() {
        /*const position = SectionPosition.Header;
        const blocked: Map<string, number> = new Map();
        const list: Map<string, Set<string>> = new Map();

        this.sections.forEach((section: Section, index: number) => {
            const items: Set<string> = new Set();

            if (section.position === position) {
                let commits: Set<string> | undefined = this.relations.get(index);

                if (typeof commits === 'object') {
                    commits.forEach((sha: string) => {
                        const parentIndex: number | undefined = blocked.get(sha);

                        if (typeof parentIndex === 'number') {
                            const parent: Section = this.sections[parentIndex];

                            if (parent.position > position) {
                                // add subGroup
                            }
                        } else {
                            blocked.set(sha, index);
                            items.add(sha);
                        }
                    });
                }
            }

            if (items.size) {
                list.set(section.title, items);
            }
        });*/
    }
}
