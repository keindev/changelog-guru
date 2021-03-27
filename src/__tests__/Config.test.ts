import { Config, GitServiceProvider } from '../core/Config';

describe('Config', () => {
  let config: Config;

  beforeAll(() => {
    config = new Config();
  });

  it('Created with default options', () => {
    expect(config.bump).toBeFalsy();
    expect(config.branch).toBeFalsy();
    expect(config.filePath).toBe('CHANGELOG.md');
    expect(config.exclusions.length).toBeFalsy();
    expect(config.provider).toBe(GitServiceProvider.GitHub);
    expect(config.rules.length).toBeFalsy();
    expect(config.types.length).toBeFalsy();
  });

  it('Default configuration init', async () => {
    await config.init();

    expect(config.bump).toBeFalsy();
    expect(config.branch).toBe('master');
    expect(config.filePath).toBe('CHANGELOG.md');
    expect(config.provider).toBe(GitServiceProvider.GitHub);
    expect(config.rules.length).toBeTruthy();
    expect(config.types).toMatchObject([
      ['break', 'major'],
      ['feat', 'minor'],
      ['improve', 'minor'],
      ['fix', 'patch'],
      ['chore', 'patch'],
      ['refactor', 'patch'],
      ['test', 'patch'],
      ['docs', 'patch'],
      ['build', 'patch'],
      ['types', 'patch'],
      ['style', 'patch'],
      ['workflow', 'patch'],
      ['perf', 'patch'],
      ['revert', 'patch'],
    ]);
    expect(config.exclusions).toMatchObject([
      ['authorLogin', ['dependabot[bot]', 'dependabot-preview[bot]']],
      ['commitType', ['build']],
      ['commitScope', ['deps', 'deps-dev']],
      ['commitSubject', ['merge']],
    ]);
  });
});
