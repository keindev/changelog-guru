import path from 'path';
import chalk from 'chalk';
import Author from './author';
import Commit from './commit';
import Plugin from './plugin';
import Key from '../utils/key';
import Config, { ConfigOptions } from './config';
import Section, { Position } from './section';
import { Constructable, Importable } from '../utils/types';
import Process from '../utils/process';
import Task from '../utils/task';
import Version from '../utils/version';

const $process = Process.getInstance();

export interface Context {
    findSection(title: string): Section | undefined;
    addSection(title: string, position: Position): Section;
}

export default class State implements Context {
    public static DEFAULT_VERSION = '0.0.1';

    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private version: string;

    public constructor(version: string = State.DEFAULT_VERSION) {
        this.version = version;
    }

    public getVersion(): string {
        return this.version;
    }

    public setVersion(version: string): void {
        const newVersion = Version.clear(version);

        if (newVersion && Version.greaterThan(newVersion, this.version)) this.version = newVersion;
    }

    public addCommit(commit: Commit, author: Author): void {
        const { commits, authors } = this;

        if (!commits.has(commit.sha)) {
            commits.set(commit.sha, commit);

            if (!authors.has(author.id)) authors.set(author.id, author);
        }
    }

    public findSection(title: string): Section | undefined {
        return this.sections.find((section): boolean => Key.isEqual(section.title, title));
    }

    public addSection(title: string, position: Position = Position.Group): Section {
        let section: Section | undefined = this.findSection(title);

        if (typeof section === 'undefined') {
            $process.task(`Added Section: ${chalk.bold(title)} [${position}]`).complete();
            this.sections.push((section = new Section(title, position)));
        }

        return section;
    }

    public async modify(config: Config): Promise<void> {
        const { plugins, options } = config;
        const task = $process.task('Modify release state');

        this.updateCommitsTypes(config);
        await Promise.all(plugins.map((name): Promise<void> => this.importPlugin(name, options, task)));
        this.updateSections();
        this.updateVersion();
        task.complete();
    }

    public updateSections(): void {
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach(
                (section): void => {
                    if (section.getPosition() === Position.Group) {
                        State.matchSubsectionWith(section, relations);
                    } else {
                        State.matchSectionWith(section, relations);
                    }
                }
            );
        }

        // FIXME: creates wrong sections tree
        this.sections = sections
            .filter((section): boolean => section.getPosition() !== Position.Subsection && !!section.getWeight())
            .sort(Section.compare);
    }

    private updateCommitsTypes(config: Config): void {
        this.commits.forEach((commit): void => commit.setType(config.getType(commit.getPrefix())));
    }

    private updateVersion(): void {
        const changes: [number, number, number] = [0, 0, 0];

        this.commits.forEach(
            (commit): void => {
                changes[commit.getType()]++;
            }
        );

        this.setVersion(Version.update(this.version, ...changes));
    }

    private static matchSubsectionWith(section: Section, relations: Map<string, Section>): void {
        const firstCommit = section.getFirstCommit();
        let parent: Section | undefined;

        if (firstCommit) {
            parent = relations.get(firstCommit.sha);

            if (parent) parent.assign(section);
        }

        section.getCommits().forEach(
            (commit): void => {
                parent = relations.get(commit.sha);

                if (parent) parent.remove(commit);

                relations.set(commit.sha, section);
            }
        );
    }

    private static matchSectionWith(section: Section, relations: Map<string, Section>): void {
        section.getCommits().forEach(
            (commit): void => {
                if (relations.has(commit.sha)) {
                    section.remove(commit);
                } else {
                    relations.set(commit.sha, section);
                }
            }
        );
    }

    private async importPlugin(name: string, options: ConfigOptions, task: Task): Promise<void> {
        const module: Importable<Plugin, Context> = await import(path.resolve(__dirname, '../plugins', `${name}.js`));
        const PluginClass: Constructable<Plugin, Context> = module.default;

        task.log(`${chalk.bold(name)} plugin imported`);

        if (PluginClass && PluginClass.constructor && PluginClass.call && PluginClass.apply) {
            const plugin: Plugin = new PluginClass(this);
            const subtask = task.add(`Changing state with ${chalk.bold(PluginClass.name)}`);
            const commits: Commit[] = [...this.commits.values()];

            if (plugin instanceof Plugin) {
                await plugin.init(options);
                await Promise.all(commits.map((commit: Commit): Promise<void> => plugin.parse(commit, subtask)));

                subtask.complete();
            } else {
                subtask.fail(`${chalk.bold(PluginClass.name)} is not Plugin class`);
            }
        } else {
            task.fail(`${chalk.bold(PluginClass.name)} is not constructor`);
        }
    }
}
