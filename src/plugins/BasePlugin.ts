import { IPluginOption } from '../config/Config';
import { IPluginContext, IPlugin } from './PluginLoader';

export default abstract class BasePlugin implements IPlugin {
    protected context: IPluginContext;

    public constructor(context: IPluginContext) {
        this.context = context;
    }

    public abstract async init(config: IPluginOption): Promise<void>;
}
