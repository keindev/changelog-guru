import { Task } from 'tasktree-cli/lib/task';
import { ConfigLoader } from '../src/config/config-loader';
import { Config } from '../src/config/config';
import { MockLinter } from './__mocks__/linter.mock';

describe('Linter', (): void => {
    let $task: Task;
    let $config: Config;

    beforeAll((done): void => {
        const loader = new ConfigLoader();

        loader.load().then((config): void => {
            $config = config;

            expect(config).toBeDefined();
            done();
        });
    });

    beforeEach((): void => {
        $task = new Task('Lint commit header');
    });

    it('Default', (done): void => {
        const linter = new MockLinter($task, {
            config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
            plugins: $config.getPlugins(),
            types: $config.getTypes().map(([name]): string => name),
        });

        Promise.all([
            linter.lint('test(core): some subject message 1'),
            linter.lint('test: some subject message 2'),
        ]).then((): void => {
            expect($task.haveErrors()).toBeFalsy();

            done();
        });
    });

    it('Incorrect commit messages', (done): void => {
        const linter = new MockLinter($task, {
            config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
            plugins: $config.getPlugins(),
            types: $config.getTypes().map(([name]): string => name),
        });

        Promise.all([linter.lint(''), linter.lint('Test:'), linter.lint('wow: some subject message')]).then(
            (): void => {
                expect($task.haveErrors()).toBeTruthy();
                done();
            }
        );
    });
});
