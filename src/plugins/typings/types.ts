import { BasePlugin } from '../base-plugin';
import { CommitPlugin } from '../commit-plugin';
import { StatePlugin } from '../state-plugin';

export type PluginType = BasePlugin | CommitPlugin | StatePlugin;

export interface ConstructablePlugin<T, C> {
    new (context: C): T;
}

export interface ImportablePlugin<T, C> {
    default: ConstructablePlugin<T, C>;
}
