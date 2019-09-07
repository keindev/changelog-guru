import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/state/state.mock';
import AttentionPlugin, { AttentionPluginOptions } from '../../src/plugins/implementations/attention';
import { ConfigLoader } from '../../src/config/config-loader';
import { DependencyRule, DependencyRuleType } from '../../src/package/rules/dependency-rule';
import { ChangeLevel } from '../../src/config/config';

describe('AttentionPlugin', (): void => {
    let $loader: ConfigLoader;
    let $context: MockState;
    let $plugin: AttentionPlugin;
    let $task: Task;

    beforeEach((done): void => {
        $loader = new ConfigLoader();
        $context = new MockState();
        $plugin = new AttentionPlugin($context);
        $task = new Task('test task');

        $loader.load().then((config): void => {
            const options = config.getPlugin('attention');

            if (options) {
                $plugin.init(options as AttentionPluginOptions).then((): void => {
                    done();
                });
            } else {
                expect(options).toBeDefined();
            }
        });
    });

    it('Default', (): void => {
        expect($context.getSections().length).toBe(1);
        expect($context.findSection('Important Changes')).toBeDefined();
    });

    it('Changed license', (done): void => {
        $context.setLicense('MIT', undefined);

        const section = $context.findSection('Important Changes');
        const license = $context.getLicense();

        expect(section).toBeDefined();
        expect(license).toBeDefined();

        if (section && license) {
            $plugin.modify($task).then((): void => {
                const [subsection] = section.getSections();

                expect(subsection).toBeDefined();
                expect(subsection.getName()).toBe('License');
                expect(
                    subsection
                        .getMessages()
                        .map((message): [ChangeLevel, string] => [message.getChangeLevel(), message.text])
                ).toMatchSnapshot();

                done();
            });
        }
    });

    it('Changed dependencies', (done): void => {
        $context.setPackageRule(
            new DependencyRule(
                DependencyRuleType.Dependencies,
                {
                    test: '^1.1.0',
                },
                {
                    test: '^1.0.0',
                }
            )
        );

        const section = $context.findSection('Important Changes');

        expect(section).toBeDefined();

        if (section) {
            $plugin.modify($task).then((): void => {
                const [subsection] = section.getSections();

                expect(subsection).toBeDefined();
                expect(subsection.getName()).toBe('Dependencies');
                expect(
                    subsection
                        .getMessages()
                        .map((message): [ChangeLevel, string] => [message.getChangeLevel(), message.text])
                ).toMatchSnapshot();

                done();
            });
        }
    });
});
