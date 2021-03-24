import Entity, { IEntity, Priority } from './Entity';

export interface IAuthor extends IEntity {
  readonly url: string;
  readonly avatar: string;

  contribute(value?: number): void;
}

export interface IAuthorOptions {
  name: string;
  url: string;
  avatar: string;
}

const DEFAULT_AVATAR_SIZE = 40;
const PRIORITY_INCREASE_STEP = 1;
const URL_SIZE_PARAMETER_NAME = 's';

export default class Author extends Entity implements IAuthor {
  readonly url: string;
  readonly avatar: string;

  #priority = 0;

  constructor({ name, url, avatar }: IAuthorOptions) {
    super(`@${name}`);

    const avatarUrl = new URL(avatar);

    avatarUrl.searchParams.delete(URL_SIZE_PARAMETER_NAME);
    avatarUrl.searchParams.append(URL_SIZE_PARAMETER_NAME, `${DEFAULT_AVATAR_SIZE}`);
    this.url = url;
    this.avatar = `${avatarUrl}`;
  }

  get priority(): Priority | number {
    return this.#priority;
  }

  contribute(value = PRIORITY_INCREASE_STEP): void {
    if (value > 0) this.#priority += value;
  }
}
