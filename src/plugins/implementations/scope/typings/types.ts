import { PluginOption } from '../../../../config/typings/types';

export interface ScopeNames {
    [key: string]: string;
}

export interface ScopePluginOptions extends PluginOption {
    onlyPresented: boolean;
    names: ScopeNames;
}
