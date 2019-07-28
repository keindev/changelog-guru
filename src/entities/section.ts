import { Commit } from './commit';
import { Message } from './message';
import { Priority, Compare } from '../typings/enums';
import { SectionPosition } from './typings/enums';
import { Entity } from './entity';

export class Section extends Entity {
    private position: SectionPosition;
    private entities: Map<string, Entity> = new Map();

    public constructor(title: string, position: SectionPosition) {
        super(title);

        this.position = position;
    }

    public static compare(a: Section, b: Section): number {
        let result = b.getPosition() - a.getPosition() || super.compare(a, b);

        if (result === Compare.Equal) result = a.getName().localeCompare(b.getName());

        return result;
    }

    public static filter(s: Section): boolean {
        return super.filter(s) || s.getPosition() !== SectionPosition.Subsection;
    }

    public getPosition(): SectionPosition {
        return this.position;
    }

    public setPosition(position: SectionPosition): void {
        this.position = position;
    }

    public getSections(): Section[] {
        const sections = [...this.entities.values()].filter((value): boolean => value instanceof Section) as Section[];

        return sections.sort(Section.compare);
    }

    public getCommits(): Commit[] {
        const commits = [...this.entities.values()].filter((value): boolean => value instanceof Commit) as Commit[];

        return commits.sort(Commit.compare);
    }

    public getMessages(): Message[] {
        const messages = [...this.entities.values()].filter((value): boolean => value instanceof Message) as Message[];

        return messages.sort(Message.compare);
    }

    public getPriority(): Priority {
        let priority = super.getPriority();

        if (priority === Priority.Default) {
            priority = this.getMessages().reduce((acc, message): number => acc + message.getPriority(), priority);
            priority = this.getCommits().reduce((acc, commit): number => acc + commit.getPriority(), priority);
        }

        return priority;
    }

    public add(entity: Commit | Section | Message): void {
        const { entities } = this;
        const name = entity.getName();

        if (!entities.has(name)) {
            entities.set(name, entity);

            if (entity instanceof Section) {
                (entity as Section).setPosition(SectionPosition.Subsection);
            }
        }
    }

    public remove(entity: Commit | Section | Message): void {
        if (this.entities.delete(entity.getName())) {
            if (entity instanceof Section) {
                (entity as Section).setPosition(SectionPosition.Group);
            }
        }
    }

    public isEmpty(): boolean {
        return !this.entities.size;
    }

    public assignAsSubsection(relations: Map<string, Section>): void {
        const commits = this.getCommits();

        if (commits.length) {
            let parent = relations.get(commits[0].getName());

            if (parent) parent.add(this);

            commits.forEach((commit): void => {
                parent = relations.get(commit.getName());

                if (parent) parent.remove(commit);

                relations.set(commit.getName(), this);
            });
        }
    }

    public assignAsSection(relations: Map<string, Section>): void {
        const commits = this.getCommits();

        commits.forEach((commit): void => {
            if (relations.has(commit.getName())) {
                this.remove(commit);
            } else {
                relations.set(commit.getName(), this);
            }
        });
    }
}
