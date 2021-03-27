import Commit, { ICommit } from './Commit';
import Entity, { Compare, IEntity, Priority } from './Entity';
import Message, { IMessage } from './Message';

export enum SectionPosition {
  None = 0,
  Subsection = 1,
  Details = 2,
  Group = 3,
  Footer = 4,
  Body = 5,
  Header = 6,
}

export enum SectionOrder {
  Default = 0,
  Max = Number.MAX_SAFE_INTEGER,
  Min = Number.MIN_SAFE_INTEGER,
}

export interface ISection extends IEntity {
  readonly title: string;
  readonly sections: ISection[];
  readonly commits: ICommit[];
  readonly messages: IMessage[];
  readonly isSubsection: boolean;
  readonly isDetails: boolean;
  readonly isGroup: boolean;
  readonly isEmpty: boolean;

  order: number;
  position: SectionPosition;

  add(entity: ICommit | ISection | IMessage): void;
  remove(entity: ICommit | ISection | IMessage): void;
  assign(relations: Map<string, ISection>, type?: SectionPosition.Subsection): void;
}

export interface ISectionOptions {
  name: string;
  position?: SectionPosition;
  order?: number;
  emoji?: string;
}

export default class Section extends Entity implements ISection {
  #order: number;
  #emoji: string | undefined;
  #position: SectionPosition;
  #entities = new Map<string, IEntity>();

  constructor({ name, position, order, emoji }: ISectionOptions) {
    super(name);

    this.#order = order ?? SectionOrder.Default;
    this.#emoji = emoji;
    this.#position = position ?? SectionPosition.None;
  }

  static compare(a: ISection, b: ISection): Compare {
    let result = b.position - a.position || a.order - b.order || super.compare(a, b);

    if (result === Compare.Equal) result = a.name.localeCompare(b.name);

    return Math.min(Math.max(result, Compare.Less), Compare.More);
  }

  get title(): string {
    return this.#emoji ? `${this.#emoji} ${this.name}` : this.name;
  }

  get sections(): ISection[] {
    return this.listOf(Section) as ISection[];
  }

  get commits(): ICommit[] {
    return this.listOf(Commit) as ICommit[];
  }

  get messages(): IMessage[] {
    return this.listOf(Message) as IMessage[];
  }

  get priority(): Priority {
    let priority = super.priority;

    if (this.#entities.size) {
      [this.sections, this.messages, this.commits].forEach((entities: IEntity[]) => {
        priority = entities.reduce((acc, entity) => acc + entity.priority, priority);
      });
    }

    return priority;
  }

  get position(): SectionPosition {
    return this.#position;
  }

  set position(position: SectionPosition) {
    this.#position = position;
  }

  get order(): number {
    return this.#order;
  }

  set order(order: number) {
    this.#order = order;
  }

  get isSubsection(): boolean {
    return this.position === SectionPosition.Subsection;
  }

  get isDetails(): boolean {
    return this.position === SectionPosition.Details;
  }

  get isGroup(): boolean {
    return this.position === SectionPosition.Group;
  }

  get isEmpty(): boolean {
    return !this.#entities.size;
  }

  add(entity: ICommit | ISection | IMessage): void {
    if (!this.#entities.has(entity.name)) {
      this.#entities.set(entity.name, entity);

      if (entity instanceof Section && !entity.isDetails) entity.position = SectionPosition.Subsection;
    }
  }

  remove(entity: ICommit | ISection | IMessage): void {
    if (this.#entities.delete(entity.name) && entity instanceof Section) entity.position = SectionPosition.Group;
  }

  assign(relations: Map<string, ISection>, type?: SectionPosition.Subsection): void {
    const { commits } = this;

    if (type) {
      if (commits.length) {
        let parent = commits[0] ? relations.get(commits[0].name) : undefined;

        if (parent) parent.add(this);

        commits.forEach(commit => {
          parent = relations.get(commit.name);

          if (parent) parent.remove(commit);

          relations.set(commit.name, this);
        });
      }
    } else {
      commits.forEach(commit => (relations.has(commit.name) ? this.remove(commit) : relations.set(commit.name, this)));
    }
  }

  private listOf(cls: typeof Section | typeof Commit | typeof Message): IEntity[] {
    return [...this.#entities.values()].filter(value => value instanceof cls).sort((cls as typeof Entity).compare);
  }
}
