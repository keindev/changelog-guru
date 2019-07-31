import { PluginOption } from '../../../../config/typings/types';

export interface ScopeTitles {
    [key: string]: string;
}

export interface ScopePluginOptions extends PluginOption {
    onlyPresented: boolean;
    titles: ScopeTitles;
}
