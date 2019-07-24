import { Modification } from '../../utils/enums';

export interface PackageEngine {
    [x: string]: string;
}

export class Engine {
    private engines: Map<string, string>;
    private statuses: Map<string, Modification> = new Map();

    public constructor(engine?: PackageEngine, prev?: PackageEngine) {
        this.engines = engine ? new Map(Object.entries(engine)) : new Map();

        if (prev) {
            const { engines, statuses } = this;

            Object.keys(prev).forEach((name): void => {
                const version = engines.get(name);

                if (version) {
                    // TODO: version compare
                } else {
                    engines.set(name, prev[name]);
                    statuses.set(name, Modification.Removed);
                }
            });
        }
    }
}
