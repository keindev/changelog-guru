export class CLI {
    public static splitToList(values: string): string[] {
        return values.split(',').filter(Boolean);
    }

    public static appendKeysTo<K, V>(map: Map<K, V>, keys: K[], value: V): void {
        if (Array.isArray(keys) && keys.length) {
            keys.forEach((key): void => {
                map.set(key, value);
            });
        }
    }

    public static appendValuesTo<K, V>(map: Map<K, V[]>, values: V[], key: K): void {
        if (Array.isArray(values) && values.length) {
            map.set(key, values);
        }
    }
}
