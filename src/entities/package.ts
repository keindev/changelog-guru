import chalk from 'chalk';
import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import { TaskTree } from 'tasktree-cli';
import { Option } from '../utils/types';
import Version from '../utils/version';

const $tasks = TaskTree.tree();

export interface PackageInterface {
    version: string;
    repository: Option;
}

export default class Package {
    public readonly url: string;

    private version: string | undefined;

    public constructor() {
        const task = $tasks.add('Reading package.json');
        const { version, repository } = readPkg.sync({ normalize: true });

        this.version = Version.clear(version);

        if (!version) task.fail('pkg.version is not specified');
        if (!this.version) task.fail('pkg.version is invalid (see https://semver.org/)');

        switch (typeof repository) {
            case 'string':
                this.url = repository;
                break;
            case 'object':
                this.url = repository.url;
                break;
            default:
                this.url = '';
                break;
        }

        if (!this.url) task.fail('Package repository url is not specified');

        task.complete();
    }

    public getVersion(): string | undefined {
        return this.version;
    }

    public async update(version: string): Promise<void> {
        const task = $tasks.add(`Writing version to package.json`);
        const newVersion = Version.clear(version);

        if (newVersion && Version.greaterThan(newVersion, this.version)) {
            this.version = newVersion;

            await writePkg({ version: newVersion });

            task.complete(`Package version updated to ${chalk.bold(newVersion)}`);
        } else {
            task.fail(`New package version [${chalk.bold(version)}] is invalid or less (see https://semver.org/)`);
        }
    }
}
