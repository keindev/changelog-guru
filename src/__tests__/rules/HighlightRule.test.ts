import { Config } from '../../core/Config.js';
import Author from '../../core/entities/Author.js';
import Commit from '../../core/entities/Commit.js';
import HighlightRule from '../../core/rules/HighlightRule.js';
import State from '../../core/State.js';

describe('Highlight rule', () => {
  let config: Config;
  let context: State;
  let rule: HighlightRule;

  beforeAll(async () => {
    config = new Config();
    context = new State('MIT');
    await config.init();
    rule = config.rules.find(item => item instanceof HighlightRule) as HighlightRule;
  });

  it('Generics highlight', () => {
    const author = new Author({
      login: 'keindev',
      url: 'https://github.com/keindev',
      avatar: 'https://avatars.githubusercontent.com/u/4527292?v=4',
    });
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
        hash: '779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
        timestamp: 0,
        body: '',
        url: 'https://github.com/keindev/changelog-guru/commit/779ed9b4803da533c1d55f26e5cc7d58ff3d47b6',
        author,
        headline,
      });

      rule.parse({ commit, context });
      expect(commit.subject).toBe(result);
    });
  });
});
