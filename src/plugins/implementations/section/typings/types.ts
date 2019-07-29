import { PluginOption } from '../../../../config/typings/types';

export interface SectionOption extends PluginOption {
    [key: string]: string[];
}

export interface SectionPluginOptions extends PluginOption {
    section: SectionOption[];
}
