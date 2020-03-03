export const parseChangesTypes = (changes: IConfig['changes']): void => {
    if (changes) {
        const levels = Object.values(ChangeLevel);

        Object.entries(changes).forEach(([level, names]) => {
            if (!Array.isArray(names)) TaskTree.fail(`Names of change level "${level}" must be array`);
            if (!levels.includes(level)) TaskTree.fail(`Unexpected level "${level}" of changes`);

            names.forEach(name => {
                this.types.set(name, level as ChangeLevel);
            });
        });
    }
};

export const parseExclusions = (output: IConfig['output']): void => {
    if (output?.exclude) {
        const types = Object.values(ExclusionType);

        Object.entries(output.exclude).forEach(([name, rules]) => {
            if (!types.includes(name)) TaskTree.fail('Unexpected exclusion name');

            this.exclusions.set(name, [...new Set(rules)]);
        });
    }
};

export const parsePlugins = (plugins: IConfig['plugins']): void => {
    if (Array.isArray(plugins)) {
        plugins.forEach(plugin => {
            if (typeof plugin === 'string') {
                this.plugins.set(plugin, {});
            } else {
                Object.entries<IPluginConfig>(plugin).forEach(([name, config]) => {
                    if (config) {
                        this.plugins.set(
                            name,
                            new Proxy(config, {
                                get(target, fieldName, receiver): IPluginConfig {
                                    return Reflect.get(target, fieldName, receiver);
                                },
                                set(): boolean {
                                    return false;
                                },
                            })
                        );
                    }
                });
            }
        });
    }
};
