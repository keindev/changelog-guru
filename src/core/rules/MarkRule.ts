import { findSame } from '../../utils/text.js';
import { CommitChangeType } from '../entities/Commit.js';
import { ISection, SectionOrder, SectionPosition } from '../entities/Section.js';
import { BaseRule, IRule, IRuleConfig, IRuleLintOptions, IRuleParseOptions, IRulePrepareOptions } from './BaseRule.js';

export enum MarkerType {
  // !break - indicates major changes breaking backward compatibility
  Breaking = 'break',
  // !deprecate- place a commit title to special section with deprecated properties
  Deprecated = 'deprecated',
  // !group(NAME) - creates a group of commits with the <NAME>
  Grouped = 'group',
  // !ignore - ignore a commit in output
  Ignore = 'ignore',
  // !important - place a commit title to special section on top of changelog
  Important = 'important',
}

export interface IMarkRuleConfig extends IRuleConfig {
  joins: {
    [MarkerType.Breaking]: string;
    [MarkerType.Deprecated]: string;
    [MarkerType.Important]: string;
  };
}

const POSITIONS_MAP: { [key: string]: SectionPosition | undefined } = {
  [MarkerType.Breaking]: SectionPosition.Header,
  [MarkerType.Deprecated]: SectionPosition.Header,
  [MarkerType.Important]: SectionPosition.Body,
};

const COMMIT_CHANGE_TYPES_MAP: { [key: string]: CommitChangeType | undefined } = {
  [MarkerType.Breaking]: CommitChangeType.BreakingChanges,
  [MarkerType.Deprecated]: CommitChangeType.Deprecated,
  [MarkerType.Important]: CommitChangeType.Important,
};

export default class MarkRule extends BaseRule<IMarkRuleConfig> implements IRule {
  readonly #markers = new Set<MarkerType>();
  #sections = new Map<MarkerType, ISection>();

  constructor(config: IMarkRuleConfig) {
    super(config);

    this.#markers = new Set(Object.values(MarkerType));
  }

  lint({ task, body }: IRuleLintOptions): void {
    const [markersLine, blackLine, bodyFirstLine] = body;
    const markers = this.getMarkersFrom(markersLine);
    const names: string[] = Object.values(MarkerType);

    if (markers.length) {
      task.log(`Markers: ${markersLine}`);

      markers.forEach(([marker, value, type]) => {
        if (!names.some(name => name === marker)) task.error(`Unexpected marker {bold !${type}}`);
        if (marker === MarkerType.Grouped && !value) task.error('{bold !group} name is empty');
      });

      if (bodyFirstLine && blackLine && blackLine.trim().length) {
        task.error('Missing blank line between markers and body');
      }
    } else if (markersLine) {
      task.error('Missing blank line between header and body');
    }
  }

  parse({ commit, context }: IRuleParseOptions): void {
    const markers = this.getMarkersFrom(commit.body[0]);
    let section: ISection | undefined;

    commit.isIgnored = !!markers.find(([marker]) => marker === MarkerType.Ignore);

    if (!commit.isIgnored) {
      markers.forEach(([marker, name]) => {
        if (COMMIT_CHANGE_TYPES_MAP[marker]) commit.changeType = COMMIT_CHANGE_TYPES_MAP[marker] as CommitChangeType;
        if (marker === MarkerType.Grouped && name && context) section = context.addSection({ name });
        if ((section = section || this.#sections.get(marker))) section.add(commit);
      });
    }
  }

  prepare({ context }: IRulePrepareOptions): void {
    const order = SectionOrder.Min;

    this.#sections = new Map(
      Object.entries(this.config.joins).reduce((acc: [MarkerType, ISection][], [type, name]) => {
        const section = context.addSection({ name, position: POSITIONS_MAP[type] ?? SectionPosition.None, order });

        if (section) {
          acc.push([type as MarkerType, section]);
        }

        return acc;
      }, [])
    );
  }

  private getMarkersFrom(text?: string): [MarkerType, string, string][] {
    const markers: [MarkerType, string, string][] = [];

    if (text) {
      const expression = /!(?<name>[a-z]+)(\((?<value>[\w &]+)\)|)( |)/gi;
      let match: RegExpExecArray | null;

      while ((match = expression.exec(text)) !== null) {
        const { name, value } = match.groups ?? {};

        if (name) {
          const marker = findSame(name, [...this.#markers]);

          if (marker) markers.push([marker as MarkerType, value ?? '', name]);
        }
      }
    }

    return markers;
  }
}
