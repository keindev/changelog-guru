import Commit from './Commit';
import Message from './Message';
import Entity, { Compare, Priority } from './Entity';

export enum Position {
    None = 0,
    Subsection = 1,
    Group = 2,
    Footer = 3,
    Body = 4,
    Header = 5,
}

export enum Order {
    Default = 0,
    Max = Number.MAX_SAFE_INTEGER,
    Min = Number.MIN_SAFE_INTEGER,
}

export default class Section extends Entity {
    #order: number;
    #position: Position;
    #entities = new Map<string, Entity>();

    constructor(title: string, position: Position, order: number = Order.Default) {
        super(title);

        this.#order = order;
        this.#position = position;
    }

    static compare(a: Section, b: Section): Compare {
        let result = b.position - a.position || a.order - b.order || super.compare(a, b);

        if (result === Compare.Equal) result = a.name.localeCompare(b.name);

        return Math.min(Math.max(result, Compare.Less), Compare.More);
    }

    get sections(): Section[] {
        const sections = [...this.#entities.values()].filter(value => value instanceof Section) as Section[];

        return sections.sort(Section.compare);
    }

    get commits(): Commit[] {
        const commits = [...this.#entities.values()].filter(value => value instanceof Commit) as Commit[];

        return commits.sort(Commit.compare);
    }

    get messages(): Message[] {
        const messages = [...this.#entities.values()].filter(value => value instanceof Message) as Message[];

        return messages.sort(Message.compare);
    }

    get priority(): Priority {
        let priority = super.priority;

        if (this.#entities.size) {
            priority = this.sections.reduce((acc, section) => acc + section.priority, priority);
            priority = this.messages.reduce((acc, message) => acc + message.priority, priority);
            priority = this.commits.reduce((acc, commit) => acc + commit.priority, priority);
        }

        return priority;
    }

    get position(): Position {
        return this.#position;
    }

    get order(): number {
        return this.#order;
    }

    get isSubsection(): boolean {
        return this.position === Position.Subsection;
    }

    get isGroup(): boolean {
        return this.position === Position.Group;
    }

    get isEmpty(): boolean {
        return !this.#entities.size;
    }

    add(entity: Commit | Section | Message): void {
        if (!this.#entities.has(entity.name)) {
            this.#entities.set(entity.name, entity);

            if (entity instanceof Section) entity.updatePosition(Position.Subsection);
        }
    }

    remove(entity: Commit | Section | Message): void {
        if (this.#entities.delete(entity.name)) {
            if (entity instanceof Section) entity.updatePosition(Position.Group);
        }
    }

    updatePosition(position: Position): void {
        this.#position = position;
    }

    assignSubsection(relations: Map<string, Section>): void {
        const { commits } = this;

        if (commits.length) {
            let parent = relations.get(commits[0].name);

            if (parent) parent.add(this);

            commits.forEach(commit => {
                parent = relations.get(commit.name);

                if (parent) parent.remove(commit);

                relations.set(commit.name, this);
            });
        }
    }

    assignSection(relations: Map<string, Section>): void {
        this.commits.forEach(commit => {
            if (relations.has(commit.name)) {
                this.remove(commit);
            } else {
                relations.set(commit.name, this);
            }
        });
    }
}
