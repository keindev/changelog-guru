import path from 'path';
import chalk from 'chalk';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Key from '../utils/key';
import { ConfigOptions } from './config';
import Section, { Position } from './section';
import { Constructable, Importable } from '../utils/types';
import Process from '../utils/process';
import Task from '../utils/task';

const $process = Process.getInstance();

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
            $process.task(`Added Section: ${chalk.bold(title)}`).complete();
            this.sections.push((section = new Section(title, position)));
        }

        return section;
    }

    public async modify(plugins: string[], options: ConfigOptions): Promise<void> {
        const task = $process.task('Modify a release state');

        await Promise.all(
            plugins.map(
                (name: string): Promise<void> => {
                    task.log(`${chalk.bold(name)} plugin imported`);

                    return this.importPlugin(path.resolve(__dirname, '../plugins', `${name}.js`), options, task);
                }
            )
        );

        task.complete();
    }

    private async importPlugin(pluginPath: string, options: ConfigOptions, task: Task): Promise<void> {
        const pluginModule: Importable<Plugin, Context> = await import(pluginPath);
        const PluginClass: Constructable<Plugin, Context> = pluginModule.default;

        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin: Plugin = new PluginClass(this);
            const subtask = task.add(`Changing state with a ${chalk.bold(PluginClass.name)}`);
            const commits: Commit[] = [...this.commits.values()];

            if (plugin instanceof Plugin) {
                await plugin.init(options);
                await Promise.all(commits.map((commit: Commit): Promise<void> => plugin.parse(commit)));

                subtask.complete();
            } else {
                subtask.fail(`${chalk.bold(PluginClass.name)} is not a Plugin class`);
            }
        } else {
            task.fail(`${chalk.bold(PluginClass.name)} is not a constructable Plugin class`);
        }
    }
}
