import Entity, { IEntity, Priority } from './Entity';

export interface IAuthor extends IEntity {
  readonly avatar: string;
  readonly login: string;
  readonly url: string;

  contribute(value?: number): void;
}

export interface IAuthorOptions {
  avatar: string;
  login: string;
  url: string;
}

const DEFAULT_AVATAR_SIZE = 40;
const PRIORITY_INCREASE_STEP = 1;
const URL_SIZE_PARAMETER_NAME = 's';

export default class Author extends Entity implements IAuthor {
  readonly avatar: string;
  readonly login: string;
  #priority = Priority.Low;
  readonly url: string;

  constructor({ login, url, avatar }: IAuthorOptions) {
    super(`@${login}`);

    const avatarUrl = new URL(avatar);

    avatarUrl.searchParams.delete(URL_SIZE_PARAMETER_NAME);
    avatarUrl.searchParams.append(URL_SIZE_PARAMETER_NAME, `${DEFAULT_AVATAR_SIZE}`);
    this.url = url;
    this.login = login;
    this.avatar = `${avatarUrl}`;
  }

  get priority(): Priority | number {
    return this.#priority;
  }

  contribute(value = PRIORITY_INCREASE_STEP): void {
    this.#priority += Math.max(0, value);
  }
}
