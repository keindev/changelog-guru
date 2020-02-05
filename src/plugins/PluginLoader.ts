import { IPluginContext, IPlugin, IPluginConfig } from './Plugin';
import PackageChangesInformer from './implementations/PackageChangesInformer';
import Highlighter from './implementations/Highlighter';
import MarkersManager from './implementations/MarkersManager';
import ScopeLinker from './implementations/ScopeLinker';
import SectionLinker from './implementations/SectionLinker';

export default class PluginLoader {
    private context?: IPluginContext;
    private plugins = new Map<string, { new (context: IPluginContext): IPlugin }>([
        ['package-changes', PackageChangesInformer],
        ['highlights', Highlighter],
        ['markers', MarkersManager],
        ['scopes', ScopeLinker],
        ['sections', SectionLinker],
    ]);

    constructor(context?: IPluginContext) {
        this.context = context;
    }

    public async getPlugin(name: string, config: IPluginConfig): Promise<IPlugin | undefined> {
        const constructor = this.plugins.get(name);
        let plugin: IPlugin | undefined;

        if (constructor) {
            await (plugin = new constructor(this.context)).init(config);
        }

        return plugin;
    }
}
