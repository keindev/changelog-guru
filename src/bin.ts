import { TaskTree } from 'tasktree-cli';
import commander from 'commander';
import Changelog from './changelog';

const $tasks = TaskTree.tree();

$tasks.start();
commander.version(process.env.npm_package_version || '', '-v, --version').description('Git changelog generator');
commander.parse(process.argv);

// const command: Command = commander.parse(process.argv);
const changelog = new Changelog();

changelog.generate().then((): void => {
    $tasks.stop();
});
