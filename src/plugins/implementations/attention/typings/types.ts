import { DependencyModification } from '../../../../package/typings/enums';
import { AttentionType } from './enums';
import { PluginOption } from '../../../../config/typings/types';

export type AttentionTemplates = { [key in DependencyModification]?: string };
export type AttentionTypes = { [key in AttentionType]?: string };

export interface AttentionPluginOptions extends PluginOption {
    title: string;
    templates: AttentionTemplates;
    sections: AttentionTypes;
}
