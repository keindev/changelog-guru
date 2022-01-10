import { PackageDependency, PackageDependencyChangeType } from 'package-json-helper/lib/types';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config';
import { ISection } from '../../core/entities/Section';
import PackageStatisticRenderRule from '../../core/rules/PackageStatisticRenderRule';
import State from '../../core/State';

describe('Package statistic rule', () => {
  const config = new Config();
  let rule: PackageStatisticRenderRule;

  beforeAll(async () => {
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
      type: PackageDependencyChangeType.Bumped,
      value: { current: '6.1.2', previous: '5.0.8' },
    };

    context.addChanges(PackageDependency.Dependencies, [dependency]);
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
