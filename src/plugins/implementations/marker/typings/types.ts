import { PluginOption } from '../../../../config/typings/types';
import { MarkerType } from './enums';

export type MarkerCommitModifiers = (MarkerType.Ignore | MarkerType.Grouped)[];
export type MarkerSectionModifiers = {
    [key in MarkerType.Breaking | MarkerType.Deprecated | MarkerType.Important]: string;
};

export interface MarkerPluginOptions extends PluginOption {
    actions: MarkerCommitModifiers;
    joins: MarkerSectionModifiers;
}
