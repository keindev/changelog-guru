import { PluginOption } from '../../../../config/typings/types';

export interface SectionPluginOptions extends PluginOption {
    [key: string]: string[];
}
