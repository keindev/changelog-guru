import { Config, ServiceProvider, ChangeLevel, ExclusionType } from '../../src/config/config';

describe('Config', (): void => {
    it('Default', (): void => {
        const config = new Config({
            provider: ServiceProvider.GitHub,
            filePath: 'CHANGELOG.md',
            types: new Map([['feat', ChangeLevel.Minor], ['fix', ChangeLevel.Patch]]),
            plugins: new Map([['test', {}]]),
            exclusions: new Map([[ExclusionType.AuthorLogin, ['bot']]]),
        });

        expect(config.getExclusions()).toStrictEqual([[ExclusionType.AuthorLogin, ['bot']]]);
        expect(config.getPlugins()).toStrictEqual([['test', {}]]);
        expect(config.getTypes()).toStrictEqual([['feat', ChangeLevel.Minor], ['fix', ChangeLevel.Patch]]);
    });
});
