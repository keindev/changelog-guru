import * as semver from 'semver';
import readPkg from 'read-pkg';
// import writePkg from 'write-pkg';
import Process from '../utils/process';
import { Option } from '../utils/types';

const $process = Process.getInstance();

export interface PackageInterface {
    version: string;
    repository: Option;
}

export default class Package {
    public readonly version: string;
    public readonly url: string;

    public constructor() {
        const task = $process.task('Reading package.json');
        const { version, repository } = readPkg.sync({ normalize: true });
        const actualVersion = semver.valid(version) || undefined;

        if (!version) task.fail('pkg.version is not specified');
        if (!actualVersion) task.fail('pkg.version is invalid (see https://semver.org/)');

        this.version = actualVersion || '';

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
}
