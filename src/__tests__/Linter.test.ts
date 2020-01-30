import { Task } from 'tasktree-cli/lib/task';
import ConfigLoader from '../config/ConfigLoader';
import Config from '../config/Config';
import { MockLinter } from '../__mocks__/Linter.mock';

let task: Task;
let config: Config;

describe('Linter', () => {
    beforeAll(done => {
        const loader = new ConfigLoader();

        loader.load().then(defaultConfig => {
            config = defaultConfig;

            done();
        });
    });

    beforeEach(() => {
        task = new Task('Lint commit header');
    });

    describe('Lint commit messages', () => {
        it('Default', done => {
            const linter = new MockLinter(task, {
                config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
                plugins: config.getPlugins(),
                types: config.getTypes().map(([name]) => name),
            });

            Promise.all([
                linter.lint('test(core): some subject message 1'),
                linter.lint('test: some subject message 2'),
            ]).then(() => {
                expect(task.haveErrors()).toBeFalsy();

                done();
            });
        });

        it('Incorrect commit messages', done => {
            const linter = new MockLinter(task, {
                config: { lowercaseTypesOnly: true, maxHeaderLength: MockLinter.DEFAULT_HEADER_MAX_LENGTH },
                plugins: config.getPlugins(),
                types: config.getTypes().map(([name]) => name),
            });

            Promise.all([linter.lint(''), linter.lint('Test:'), linter.lint('wow: some subject message')]).then(() => {
                expect(task.haveErrors()).toBeTruthy();
                done();
            });
        });
    });
});
