import chalk from 'chalk';
import State from '../entities/state';
import Package from '../entities/package';
import Process from '../utils/process';
import Version from '../utils/version';
import Task from '../utils/task';

const $process = Process.getInstance();

export default class Writer {
    public static async write(state: State, pkg: Package): Promise<void> {
        const task = $process.task('Write changelog');

        await Writer.updatePackage(state, pkg, task);
        // await Writer.writeSections(state.getSections());

        task.complete();
    }

    /* private static writeSections(tree: Section[]): void {
        // unlink if exists
        // const text = tree.map(section => section.render()).join('');
        // write text
    } */

    private static async updatePackage(state: State, pkg: Package, task: Task): Promise<void> {
        const v1 = state.getVersion();
        const v2 = pkg.getVersion();
        const subtask = task.add(`Update package version to ${chalk.bold(v1)}`);

        if (Version.greaterThan(v1, v2)) {
            pkg.update(v1);
            subtask.complete();
        } else {
            subtask.skip('Current package version is geater');
        }
    }
}
