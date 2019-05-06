import * as semver from 'semver';

export default class Version {
    public static clear(version: string): string | undefined {
        return semver.valid(semver.coerce(version) || '') || undefined;
    }

    public static greaterThan(v1?: string, v2?: string): boolean {
        return (!!v1 && !v2) || (!!v1 && !!v2 && semver.gt(v1, v2));
    }

    public static update(version: string, major: number, minor: number, patch: number): string {
        let newVersion: string | undefined;

        if (major) newVersion = semver.inc(version, 'major') || undefined;
        if (!major && minor) newVersion = semver.inc(version, 'minor') || undefined;
        if (!major && !minor && patch) newVersion = semver.inc(version, 'patch') || undefined;

        return newVersion || version;
    }
}
