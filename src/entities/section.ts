import { Commit } from './commit';
import { Message } from './message';
import { Priority, Compare } from '../typings/enums';
import { Entity } from './entity';

export enum SectionPosition {
    None = 0,
    Subsection = 1,
    Group = 2,
    Footer = 3,
    Body = 4,
    Header = 5,
}

export enum SectionOrder {
    Default = 0,
    Max = Number.MAX_SAFE_INTEGER,
    Min = Number.MIN_SAFE_INTEGER,
}

export class Section extends Entity {
    private index: number = SectionOrder.Default;
    private position: SectionPosition;
    private entities: Map<string, Entity> = new Map();

    public constructor(title: string, position: SectionPosition) {
        super(title);

        this.position = position;
    }

    public static compare(a: Section, b: Section): Compare {
        let result = b.getPosition() - a.getPosition() || a.getOrder() - b.getOrder() || super.compare(a, b);

        if (result === Compare.Equal) result = a.getName().localeCompare(b.getName());

        return Math.min(Math.max(result, Compare.Less), Compare.More);
    }

    public getOrder(): SectionOrder | number {
        return this.index;
    }

    public setOrder(index: SectionOrder | number): void {
        this.index = index;
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

        if (this.entities.size) {
            priority = this.getSections().reduce((acc, section): number => acc + section.getPriority(), priority);
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
