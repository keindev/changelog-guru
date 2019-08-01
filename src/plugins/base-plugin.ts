import { StateContext } from '../state/typings/types';
import { PluginOption } from '../config/typings/types';

export abstract class BasePlugin {
    protected context: StateContext;

    public constructor(context: StateContext) {
        this.context = context;
    }

    public abstract async init(config: PluginOption): Promise<void>;
}
