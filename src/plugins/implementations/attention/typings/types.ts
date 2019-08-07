import { PluginOption } from '../../../../config/typings/types';
import { PackageRuleChangeType } from '../../../../package/rules/typings/enums';
import { PackageRuleType } from '../../../../package/typings/types';

export type AttentionTemplates = { [key in PackageRuleChangeType]?: string };

export interface AttentionPluginOptions extends PluginOption {
    title: string;
    templates: AttentionTemplates;
    sections: PackageRuleType[];
}
