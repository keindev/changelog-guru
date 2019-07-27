import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/entities/state.mock';
import { Configuration } from '../../src/entities/configuration';
import { Dependency, DependencyType } from '../../src/entities/package/dependency';
import AttentionPlugin, { AttentionConfiguration } from '../../src/plugins/attention';
import { Level } from '../../src/utils/enums';

describe('AttentionPlugin', (): void => {
    let config: Configuration;
    let context: MockState;
    let plugin: AttentionPlugin;
    let task: Task;

    beforeEach((done): void => {
        config = new Configuration();
        context = new MockState();
        plugin = new AttentionPlugin(context);
        task = new Task('test task');

        config.load(task).then((): void => {
            plugin.init(config.getOptions() as AttentionConfiguration).then((): void => {
                done();
            });
        });
    });

    it('Default', (): void => {
        expect(context.getSections().length).toBe(1);
        expect(context.findSection('Important Changes')).toBeDefined();
    });

    it('Changed license', (done): void => {
        context.setLicense('MIT', undefined);

        const section = context.findSection('Important Changes');
        const license = context.getLicense();

        expect(section).toBeDefined();
        expect(license).toBeDefined();

        if (section && license) {
            plugin.modify(task).then((): void => {
                const [subsection] = section.getSections();

                expect(subsection).toBeDefined();
                expect(subsection.title).toBe('License');
                expect(
                    subsection.getMessages().map((message): [Level, string] => [message.level, message.text])
                ).toMatchSnapshot();

                done();
            });
        }
    });

    it('Changed dependencies', (done): void => {
        context.setDependencies(
            new Dependency(
                DependencyType.Dependencies,
                {
                    test: '^1.1.0',
                },
                {
                    test: '^1.0.0',
                }
            )
        );

        const section = context.findSection('Important Changes');

        expect(section).toBeDefined();

        if (section) {
            plugin.modify(task).then((): void => {
                const [subsection] = section.getSections();

                expect(subsection).toBeDefined();
                expect(subsection.title).toBe('Dependencies');
                expect(
                    subsection.getMessages().map((message): [Level, string] => [message.level, message.text])
                ).toMatchSnapshot();

                done();
            });
        }
    });
});
