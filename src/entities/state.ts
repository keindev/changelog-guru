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
    private authors: Map<number, Author> = new Map();
    private commits: Map<string, Commit> = new Map();
    private sections: Section[] = [];
    private version: string;

    public constructor(version: string = Version.DEFAULT) {
        this.version = version;
    }

    private static matchSubsectionWith(section: Section, relations: Map<string, Section>): void {
        const firstCommit = section.getFirstCommit();
        let parent: Section | undefined;

        if (firstCommit) {
            parent = relations.get(firstCommit.hash);

            if (parent) parent.assign(section);
        }

        section.getCommits().forEach(
            (c): void => {
                parent = relations.get(c.hash);

                if (parent) parent.remove(c);

                relations.set(c.hash, section);
            }
        );
    }

    private static matchSectionWith(section: Section, relations: Map<string, Section>): void {
        section.getCommits().forEach(
            (c): void => {
                if (relations.has(c.hash)) section.remove(c);
                else relations.set(c.hash, section);
            }
        );
    }

    public setVersion(version: string): void {
        const newVersion = Version.clear(version);

        if (!!newVersion && Version.greaterThan(newVersion, this.version)) this.version = newVersion;
    }

    public getVersion(): string {
        return this.version;
    }

    public getSections(): Section[] {
        return this.sections;
    }

    public getAuthors(): Author[] {
        return [...this.authors.values()].sort((a, b): number => b.getContribution() - a.getContribution());
    }

    public addCommit(commit: Commit, author: Author): void {
        const { commits, authors } = this;

        if (!commits.has(commit.hash)) {
            commits.set(commit.hash, commit);

            const actualAuthor = authors.get(author.id);

            if (actualAuthor) actualAuthor.increaseContribution();
            else authors.set(author.id, author);
        }
    }

    public addSection(title: string, position: Position = Position.Group): Section {
        let section = this.findSection(title);

        if (typeof section === 'undefined') {
            $process.task(`Added Section: ${chalk.bold(title)} [${position}]`).complete();
            this.sections.push((section = new Section(title, position)));
        }

        return section;
    }

    public findSection(title: string): Section | undefined {
        return this.sections.find((s): boolean => Key.isEqual(s.title, title));
    }

    public async modify(config: Config): Promise<void> {
        const { plugins, options } = config;
        const task = $process.task('Modify release state');

        this.updateCommitsTypes(config);

        await Promise.all(plugins.map((p): Promise<void> => this.importPlugin(p, options, task)));

        this.updateSections();
        this.updateVersion();
        task.complete();
    }

    private updateSections(): void {
        const task = $process.task('Build sections tree');
        const sections = this.sections.sort(Section.compare);

        if (sections.length) {
            const relations: Map<string, Section> = new Map();

            sections.forEach(
                (s): void => {
                    if (s.getPosition() === Position.Group) {
                        State.matchSubsectionWith(s, relations);
                    } else {
                        State.matchSectionWith(s, relations);
                    }
                }
            );
        }

        this.sections = sections
            .filter((s): boolean => s.getPosition() !== Position.Subsection && !!s.getPriority())
            .sort(Section.compare)
            .reverse();
        task.complete();
    }

    private updateCommitsTypes(config: Config): void {
        this.commits.forEach((commit): void => commit.setType(config.getType(commit.getPrefix())));
    }

    private updateVersion(): void {
        const task = $process.task('Calculate release version');
        const changes: [number, number, number] = [0, 0, 0];

        this.commits.forEach(
            (c): void => {
                changes[c.getType()]++;
            }
        );

        const version = Version.update(this.version, ...changes);

        this.setVersion(version);
        task.log(`Release version: ${chalk.bold(version)}`);
        task.complete();
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
