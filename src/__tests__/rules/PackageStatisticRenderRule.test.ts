import { ChangeType, Dependencies } from 'package-json-helper/types/package';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config.js';
import { ISection } from '../../core/entities/Section.js';
import PackageStatisticRenderRule from '../../core/rules/PackageStatisticRenderRule.js';
import State from '../../core/State.js';

describe('Package statistic rule', () => {
  let config: Config;
  let rule: PackageStatisticRenderRule;

  beforeAll(async () => {
    config = new Config();
    await config.init();
    rule = config.rules.find(item => item instanceof PackageStatisticRenderRule) as PackageStatisticRenderRule;
  });

  it('Modify', () => {
    const task = new Task('Test');
    const name = 'test-package';
    const license = 'MIT';
    const link = `https://www.npmjs.com/package/${name}/v/6.1.2`;
    const context = new State(license);
    const dependency = {
      name,
      link,
      type: ChangeType.Bumped,
      value: { current: '6.1.2', previous: '5.0.8' },
    };

    context.addChanges(Dependencies.Dependencies, [dependency]);
    rule.modify({ task, context });

    const section = context.findSection('Important Changes');
    const render = (items: ISection[]): string[][][] =>
      items.map(item =>
        [item.messages.map(message => [item.name, message.level, message.text]), ...render(item.sections)].flat()
      );

    expect(section).toBeDefined();
    expect(render(section?.sections ?? [])).toMatchObject([
      [['License', 'major', `Source code now under \`${license}\` license.`]],
      [
        [
          'Dependencies',
          'patch',
          `- Bumped **[${name}](${link})** from \`${dependency.value.previous}\` to \`${dependency.value.current}\``,
        ],
      ],
    ]);
  });
});
