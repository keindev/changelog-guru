export default class Key {
    public static MAX_DIFF_PERCENT = 0.2;
    public static MAX_DIFF_DISTANCE = 1;

    public static unify(key: string): string {
        return key.trim().toLowerCase();
    }

    public static unique<T>(list: T[]): T[] {
        return [...new Set(list)];
    }

    public static inArray(key: string | undefined, list: string[]): boolean {
        if (typeof key !== 'string') return false;
        if (!list.length) return false;

        return list.some((item): boolean => Key.isEqual(key, item));
    }

    public static inSet(key: string, set: Set<string>): boolean {
        let result = true;

        if (!set.has(key)) {
            result = [...set.keys()].some((setKey): boolean => Key.isEqual(key, setKey));
        }

        return result;
    }

    public static inMap<T>(key: string, map: Map<string, T>): T | undefined {
        let uniqueKey: string = key;

        if (!map.has(key)) {
            [...map.keys()].some((mapKey): boolean => {
                const isEqual: boolean = Key.isEqual(key, mapKey);

                if (isEqual) {
                    uniqueKey = mapKey;
                }

                return isEqual;
            });
        }

        return map.get(uniqueKey);
    }

    public static getEqual(key: string, list: string[]): string | undefined {
        return list.find((item): boolean => Key.isEqual(item, key));
    }

    public static isEqual(a: string, b: string): boolean {
        let result = a === b;

        if (!result) {
            const unifiedA = Key.unify(a);
            const unifiedB = Key.unify(b);
            const { length: lengthA } = unifiedA;
            const { length: lengthB } = unifiedB;

            if (Math.abs(lengthA - lengthB) <= Key.MAX_DIFF_DISTANCE) {
                const matrix = [];
                let i = 0;
                let j = 0;

                while (i <= lengthB) matrix[i] = [i++];
                while (j <= lengthA) matrix[0][j] = j++;

                let m: number;
                let n: number;

                for (i = 1, m = 0; i <= lengthB; i++, m++) {
                    for (j = 1, n = 0; j <= lengthA; j++, n++) {
                        matrix[i][j] =
                            unifiedB.charAt(m) === unifiedA.charAt(n)
                                ? matrix[m][n]
                                : Math.min(matrix[m][n] + 1, Math.min(matrix[i][n] + 1, matrix[m][j] + 1));
                    }
                }

                const distance = matrix[lengthB][lengthA];

                result = distance <= Key.MAX_DIFF_DISTANCE || distance / lengthA <= Key.MAX_DIFF_PERCENT;
            }
        }

        return result;
    }
}
