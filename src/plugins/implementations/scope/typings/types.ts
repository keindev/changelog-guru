import { PluginOption } from '../../../../config/typings/types';

export interface ScopeTitles {
    [key: string]: string;
}

export interface ScopeOptions extends PluginOption {
    onlyPresented?: boolean;
    titles: ScopeTitles;
}

export interface ScopePluginOptions extends PluginOption {
    scope: ScopeOptions;
}
