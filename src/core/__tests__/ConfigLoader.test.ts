import ConfigLoader from '../ConfigLoader';
import { ServiceProvider } from '../config/Config';

describe('ConfigLoader', () => {
    describe('Create', () => {
        it('Default configuration loaded', done => {
            const loader = new ConfigLoader();

            loader.load().then(config => {
                expect(config.provider).toBe(ServiceProvider.GitHub);
                expect(config.filePath).toBe('CHANGELOG.md');
                expect(config.getTypes()).toMatchObject([
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
                expect(config.getExclusions()).toMatchObject([
                    ['authorLogin', ['dependabot-preview[bot]']],
                    ['commitType', ['build']],
                    ['commitScope', ['deps', 'deps-dev']],
                    ['commitSubject', ['merge']],
                ]);
                expect(config.getPlugins()).toMatchObject([
                    [
                        'attention',
                        {
                            sections: [
                                'license',
                                'os',
                                'cpu',
                                'engines',
                                'dependencies',
                                'devDependencies',
                                'peerDependencies',
                                'optionalDependencies',
                                'bundledDependencies',
                            ],
                            templates: {
                                added: 'Added %name% with %val%',
                                bumped: 'Bumped %name% from %pver% to %ver%',
                                changed: 'Changed %name% from %pval% to %val%',
                                downgraded: 'Downgraded %name% from %pver% to %ver%',
                                removed: 'Removed %name%, with %pval%',
                            },
                            title: 'Important Changes',
                        },
                    ],
                    [
                        'highlight',
                        {
                            camelCase: true,
                            masks: [
                                '<[^>]*>',
                                '[$@!]\\S+',
                                '((?<= )|^)-{1,2}[a-z0-9_-]+',
                                '(?<= |^)[a-z]+-[a-z-]+',
                                '(?<= |^)[a-z0-9_$\\[\\]()]+\\.[a-z0-9_$.()]+',
                            ],
                        },
                    ],
                    [
                        'marker',
                        {
                            actions: ['ignore', 'group'],
                            joins: {
                                break: 'BREAKING CHANGES',
                                deprecated: 'DEPRECATIONS',
                                important: 'Important Internal Changes',
                            },
                        },
                    ],
                    [
                        'scope',
                        {
                            names: {
                                api: 'API',
                                core: 'Core',
                                dts: 'TypeScript Declaration Improvements',
                                fc: 'Functional Components',
                                ssr: 'Server Side Rendering',
                            },
                            onlyPresented: false,
                        },
                    ],
                    [
                        'section',
                        {
                            'Bug Fixes': ['fix'],
                            'Code Refactoring': ['refactor'],
                            Features: ['feat'],
                            Improvements: ['improve'],
                            'Internal changes': ['types', 'workflow', 'build', 'test', 'chore', 'docs'],
                            'Performance Improvements': ['perf'],
                            Reverts: ['revert'],
                        },
                    ],
                ]);

                done();
            });
        });
    });
});
