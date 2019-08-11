import { StateContext } from '../state/state';
import { PluginOption } from '../config/config';

export abstract class BasePlugin {
    protected context: StateContext;

    public constructor(context: StateContext) {
        this.context = context;
    }

    public abstract async init(config: PluginOption): Promise<void>;
}
