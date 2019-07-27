import { TaskTree } from 'tasktree-cli';
import commander from 'commander';
import Changelog from './changelog';

const $tasks = TaskTree.tree();

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .usage('[options]')
    .option('-p, --package', 'Bump package version in package.json')
    .description('Git changelog generator')
    .parse(process.argv);

$tasks.start();

const changelog = new Changelog();

changelog.generate(commander.package).then((): void => {
    $tasks.stop();
});
