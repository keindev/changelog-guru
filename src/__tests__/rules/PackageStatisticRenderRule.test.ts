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
    const currentLicense = 'MIT';
    const context = new State(currentLicense);
    const prevVersion = coerce(faker.system.semver()) as SemVer;
    const dependency = {
      name: faker.git.branch(),
      type: DependencyChangeType.Bumped,
      version: coerce(inc(prevVersion, 'major')) as SemVer,
      prevVersion,
    };

    context.addChanges(Dependency.Dependencies, [dependency]);
    rule.modify({ task, context });

    const section = context.findSection('Important Changes');
    const [license, dependencies] = section?.sections ?? [];
    const licenseMessages = (license?.messages ?? []).map(message => [message.level, message.text]);
    const dependenciesMessages = (dependencies?.messages ?? []).map(message => [message.level, message.text]);
    const path = `[${dependency.name}](https://www.npmjs.com/package/${dependency.name}/v/${dependency.version})`;
    const version = `from \`${dependency.prevVersion}\` to \`${dependency.version}\``;

    expect(section).toBeDefined();
    expect(license).toBeDefined();
    expect(license?.name).toBe('License');
    expect(licenseMessages).toMatchObject([['patch', `Source code now under \`${currentLicense}\` license.`]]);
    expect(dependencies).toBeDefined();
    expect(dependencies?.name).toBe('Dependencies');
    expect(dependenciesMessages).toMatchObject([['patch', `-   Bumped **${path}** ${version}`]]);
  });
});
