import { Config } from '../../src/config/config';
import { ServiceProvider, ChangeLevel, ExclusionType } from '../../src/config/typings/enums';
import { GitHubProvider } from '../../src/providers/github/provider';

describe('Config', (): void => {
    it('Default', (done): void => {
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

        config.getProvider('git+https://github.com/keindev/changelog-guru.git').then((provider): void => {
            expect(provider instanceof GitHubProvider).toBeTruthy();

            done();
        });
    });
});
