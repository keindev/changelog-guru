import commander from 'commander';
import { TaskTree } from 'tasktree-cli';
import { Changelog } from './changelog';

const tasks = TaskTree.tree();

commander
    .version(process.env.npm_package_version || '', '-v, --version')
    .usage('[options]')
    .option('-b, --bump', 'Bump package version in package.json')
    .description('Git changelog generator')
    .parse(process.argv);

tasks.start();

const changelog = new Changelog({
    bumpPackageVersion: commander.bump,
});

changelog.generate().then((): void => {
    tasks.stop();
});
