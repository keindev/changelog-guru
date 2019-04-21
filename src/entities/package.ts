import * as semver from 'semver';
import readPkg from 'read-pkg';
// import writePkg from 'write-pkg';
import Process from '../utils/process';
import { Option } from '../utils/types';

export interface PackageInterface {
    version: string;
    repository: Option;
}

export default class Package {
    public readonly version: string;
    public readonly url: string;

    public constructor() {
        const { version, repository } = readPkg.sync({ normalize: false });
        const semverion: string | undefined = semver.valid(version) || undefined;

        if (!version) Process.error('pkg.version is not specified');
        if (!semverion) Process.error('version is invalid (see https://semver.org/)');
        if (!repository) Process.error('pkg.repository is not specified');
        if (!repository.url) Process.error('pkg.repository.url is not specified');

        this.version = semverion || '';
        this.url = repository.url;
    }
}
