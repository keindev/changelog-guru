import { Task } from 'tasktree-cli/lib/task';
import { MockState } from '../__mocks__/entities/state.mock';
import { Configuration } from '../../src/entities/configuration';
import { Level } from '../../src/utils/enums';
import AttentionPlugin, { Configuration as AttentionConfiguration } from '../../src/plugins/attention';

describe('AttentionPlugin', (): void => {
    const config = new Configuration();
    const context = new MockState();
    const plugin = new AttentionPlugin(context);
    const task = new Task('test task');

    it('Default', (done): void => {
        context.setLicense('MIT', undefined);
        config.load(task).then((): void => {
            plugin.init(config.getOptions() as AttentionConfiguration).then((): void => {
                expect(context.getSections().length).toBe(1);
                expect(context.findSection('Important Changes')).toBeDefined();

                done();
            });
        });
    });

    it('Changed license', (done): void => {
        const section = context.findSection('Important Changes');
        const license = context.getLicense();

        expect(section).toBeDefined();
        expect(license).toBeDefined();

        if (section && license) {
            plugin.modify(task).then((): void => {
                const data = section.getMessages().map((message): [string, number] => [message.text, message.level]);

                expect(data).toStrictEqual([[['Source code now under `MIT` license.'].join(''), Level.Major]]);

                done();
            });
        }
    });
});
