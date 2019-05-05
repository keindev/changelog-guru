import * as semver from 'semver';

export default class Version {
    public static clear(version: string): string | undefined {
        return semver.valid(semver.coerce(version) || '') || undefined;
    }

    public static greaterThan(v1?: string, v2?: string): boolean {
        return (!!v1 && !v2) || (!!v1 && !!v2 && semver.gt(v1, v2));
    }
}
