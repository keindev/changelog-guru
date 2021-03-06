import LookupManager from 'string-lookup-manager';

import { splitHeadline } from '../../utils/commit';
import { wrap } from '../../utils/markdown';
import { IAuthor } from './Author';
import Entity, { ChangeLevel, Compare, IEntity, Priority } from './Entity';

export enum CommitChangeType {
  BreakingChanges = 1,
  Deprecated = 2,
  Important = 4,
  Default = 8,
}

const COMMIT_SHOT_NAME_LENGTH = 7;

export interface ICommit extends IEntity {
  readonly body: readonly string[];
  readonly timestamp: number;
  readonly url: string;
  readonly author: IAuthor;
  readonly scope?: string;
  readonly accents: string[];
  readonly type: string;
  readonly shortName: string;

  changeType: CommitChangeType;
  subject: string;

  accent(text: string): void;
  replacement(value: string, position: number): void;
  is(status: CommitChangeType): boolean;
}

export interface ICommitOptions {
  hash: string;
  timestamp: number;
  headline: string;
  body?: string;
  url: string;
  author: IAuthor;
}

export default class Commit extends Entity implements ICommit {
  readonly body: readonly string[] = [];
  readonly timestamp: number;
  readonly url: string;
  readonly author: IAuthor;
  readonly scope?: string;

  #subject = '';
  #type?: string;
  #accents = new Set<string>();
  #changeType = CommitChangeType.Default;
  #replacements = new LookupManager();

  constructor({ hash, timestamp, headline, body, url, author }: ICommitOptions) {
    super(hash);

    this.timestamp = timestamp;
    this.url = url;
    this.author = author;

    const [type, scope, subject] = splitHeadline(headline);

    if (type) this.#type = type.toLocaleLowerCase();
    if (scope) this.scope = scope;
    if (subject) this.#subject = subject;
    if (body) this.body = body.split('\n').map(line => line.trim());
  }

  static compare(a: ICommit, b: ICommit): Compare {
    const { scope: x } = a;
    const { scope: y } = b;
    let result = super.compare(a, b);

    if (x && !y) result--;
    if (!x && y) result++;
    if (x && y) result = x.localeCompare(y);
    if (result === Compare.Equal) result = a.timestamp - b.timestamp;

    return Math.min(Math.max(result, Compare.Less), Compare.More);
  }

  get accents(): string[] {
    return [...this.#accents.values()];
  }

  get type(): string {
    return this.#type ?? '';
  }

  get priority(): Priority {
    let priority = super.priority;

    if (this.is(CommitChangeType.BreakingChanges)) priority += Priority.High;
    if (this.is(CommitChangeType.Deprecated)) priority += Priority.Medium;
    if (this.is(CommitChangeType.Important)) priority += Priority.Low;

    return priority;
  }

  get subject(): string {
    return this.#replacements.replace(this.#subject, item => wrap(item.value));
  }

  get changeType(): CommitChangeType {
    return this.#changeType;
  }

  set changeType(type: CommitChangeType) {
    this.#changeType = this.#changeType | type;

    if (this.is(CommitChangeType.Deprecated)) this.level = ChangeLevel.Minor;
    if (this.is(CommitChangeType.BreakingChanges)) this.level = ChangeLevel.Major;
  }

  get shortName(): string {
    return this.name.substr(0, COMMIT_SHOT_NAME_LENGTH);
  }

  accent(text: string): void {
    this.#accents.add(text);
  }

  replacement(value: string, position: number): void {
    this.#replacements.add(value, position);
  }

  is(type: CommitChangeType): boolean {
    return !!(this.#changeType & type);
  }
}
