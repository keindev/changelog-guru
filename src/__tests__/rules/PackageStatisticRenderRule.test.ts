import faker from 'faker';
import { coerce, inc, SemVer } from 'semver';
import { Task } from 'tasktree-cli/lib/Task';

import { Config } from '../../core/Config';
import { Dependency, DependencyChangeType } from '../../core/Package';
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
    const name = faker.git.branch();
    const version = faker.system.semver();
    const license = 'MIT';
    const link = `https://www.npmjs.com/package/${name}/v/${version}`;
    const context = new State(license);
    const dependency = {
      name,
      type: DependencyChangeType.Bumped,
      version: coerce(inc(version, 'major')) as SemVer,
      prevVersion: coerce(version) as SemVer,
      link,
    };

    context.addChanges(Dependency.Dependencies, [dependency]);
    rule.modify({ task, context });

    const section = context.findSection('Important Changes');

    expect(section).toBeDefined();
    expect(
      (section?.sections ?? []).map(({ messages, ...others }) =>
        messages.map(message => [others.name, message.level, message.text])
      )
    ).toMatchObject([
      [['License', 'major', `Source code now under \`${license}\` license.`]],
      [
        [
          'Dependencies',
          'patch',
          `- Bumped **[${name}](${link})** from \`${dependency.prevVersion}\` to \`${dependency.version}\``,
        ],
      ],
    ]);
  });
});
