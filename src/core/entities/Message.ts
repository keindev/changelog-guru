import Entity, { ChangeLevel, IEntity } from './Entity.js';

export interface IMessage extends IEntity {
  readonly text: string;
}

export default class Message extends Entity implements IMessage {
  readonly text: string;

  constructor(text: string, level: ChangeLevel = ChangeLevel.Patch) {
    super();

    this.text = text.trim();
    this.level = level;
  }

  get isEmpty(): boolean {
    return !this.text.length;
  }
}
