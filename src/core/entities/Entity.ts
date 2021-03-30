export enum Compare {
  More = 1,
  Less = -1,
  Equal = 0,
}

export enum ChangeLevel {
  Major = 'major',
  Minor = 'minor',
  Patch = 'patch',
}

export enum Priority {
  High = 1000,
  Medium = 100,
  Low = 1,
}

export interface IEntity {
  readonly name: string;
  readonly priority: Priority;
  readonly isEmpty: boolean;

  level: ChangeLevel;
  isIgnored: boolean;
}

const ENTITY_PRIORITY_MAP = {
  [ChangeLevel.Major]: Priority.High,
  [ChangeLevel.Minor]: Priority.Medium,
  [ChangeLevel.Patch]: Priority.Low,
};

export default class Entity implements IEntity {
  readonly name: string;

  #isIgnored = false;
  #level: ChangeLevel = ChangeLevel.Patch;

  constructor(name = '') {
    this.name = name;
  }

  static compare(a: IEntity, b: IEntity): Compare {
    return Math.min(Math.max(b.priority - a.priority, Compare.Less), Compare.More);
  }

  static filter(entity: IEntity): boolean {
    return !entity.isEmpty && !entity.isIgnored;
  }

  get priority(): Priority {
    return ENTITY_PRIORITY_MAP[this.#level];
  }

  get level(): ChangeLevel {
    return this.#level;
  }

  set level(level: ChangeLevel) {
    if (ENTITY_PRIORITY_MAP[level]) this.#level = level;
  }

  get isIgnored(): boolean {
    return this.#isIgnored;
  }

  set isIgnored(value: boolean) {
    if (value) this.#isIgnored = value;
  }

  get isEmpty(): boolean {
    return this.#isIgnored;
  }
}
