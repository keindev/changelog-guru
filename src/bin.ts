import { TaskTree } from 'tasktree-cli';
import commander from 'commander';
import Changelog from './changelog';

const $tasks = TaskTree.tree();

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .usage('[options]')
    .description('Git changelog generator');

commander.parse(process.argv);
$tasks.start();

const changelog = new Changelog();

changelog.generate().then((): void => {
    $tasks.stop();
});
