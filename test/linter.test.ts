import { Task } from 'tasktree-cli/lib/task';
import { ConfigLoader } from '../src/config/config-loader';
import { Config } from '../src/config/config';
import { MockLinter } from './__mocks__/linter.mock';

// eslint-disable-next-line max-lines-per-function
describe('Linter', () => {
    let $task: Task;
    let $config: Config;

    beforeAll(done => {
        const loader = new ConfigLoader();

        loader.load().then(config => {
            $config = config;

            expect(config).toBeDefined();
            done();
        });
    });

    beforeEach(() => {
        $task = new Task('Lint commit header');
    });

    it('Default', done => {
        const linter = new MockLinter($task, {
            config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
            plugins: $config.getPlugins(),
            types: $config.getTypes().map(([name]): string => name),
        });

        Promise.all([
            linter.lint('test(core): some subject message 1'),
            linter.lint('test: some subject message 2'),
        ]).then(() => {
            expect($task.haveErrors()).toBeFalsy();

            done();
        });
    });

    it('Incorrect commit messages', done => {
        const linter = new MockLinter($task, {
            config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
            plugins: $config.getPlugins(),
            types: $config.getTypes().map(([name]): string => name),
        });

        Promise.all([linter.lint(''), linter.lint('Test:'), linter.lint('wow: some subject message')]).then(() => {
            expect($task.haveErrors()).toBeTruthy();
            done();
        });
    });
});
