import faker from 'faker';

import { Config } from '../../core/Config';
import Author from '../../core/entities/Author';
import Commit from '../../core/entities/Commit';
import HighlightRule from '../../core/rules/HighlightRule';
import State from '../../core/State';

describe('Highlight rule', () => {
  const config = new Config();
  const context = new State('MIT');
  let rule: HighlightRule;

  beforeAll(async () => {
    await config.init();

    rule = config.rules.find(item => item instanceof HighlightRule) as HighlightRule;
  });

  it('Generics highlight', () => {
    const author = new Author({ login: 'keindev', url: 'https://github.com/keindev', avatar: faker.internet.avatar() });
    const headlines: [string, string][] = [
      ['feat: <subject>', '`<subject>`'],
      ['feat: $subject', '`$subject`'],
      ['feat: -subject --help --help-cli', '`-subject` `--help` `--help-cli`'],
      ['feat: fix v-bind exhaustive-deps v-else-if', 'fix `v-bind` `exhaustive-deps` `v-else-if`'],
      ['feat: fix this.$slots and ctx.slots()', 'fix `this.$slots` and `ctx.slots()`'],
      ['feat: camelCase test', '`camelCase` test'],
      ['feat: fix this.$slots ctx.slots() <slots> <slots>', 'fix `this.$slots` `ctx.slots()` `<slots>` `<slots>`'],
    ];

    headlines.map(([headline, result]) => {
      const commit = new Commit({
        hash: faker.git.commitSha(),
        timestamp: 0,
        body: '',
        url: faker.internet.url(),
        author,
        headline,
      });

      rule.parse({ commit, context });
      expect(commit.subject).toBe(result);
    });
  });
});
