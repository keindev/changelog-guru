export default class Key {
    public static MAX_STRING_DIFF_PERCENT: number = .2;

    public static unify(key: string): string {
        return key.trim().toLowerCase();
    }

    public static inSet(key: string, set: Set<string>): boolean {
        let result = true;

        if (!set.has(key)) {
            result = [...set.keys()].some((value): boolean => Key.isEqual(key, value));
        }

        return result;
    }

    public static inMap<T>(key: string, map: Map<string, T>): T | undefined {
        let uniqueKey: string = key;

        if (!map.has(key)) {
            [...map.keys()].some((value): boolean => {
                const isEqual: boolean = Key.isEqual(key, value);

                if (isEqual) {
                    uniqueKey = value;
                }

                return isEqual;
            });
        }

        return map.get(uniqueKey);
    }

    public static isEqual(a: string, b: string, ): boolean {
        let result = true;

        if (a !== b) {
            const matrix = [];
            const { length: lengthA } = a;
            const { length: lengthB } = b;
            let i = 0;
            let j = 0;

            while (i <= lengthB) matrix[i] = [i++];
            while (j <= lengthA) matrix[0][j] = j++;

            let m: number;
            let n: number;

            for (i = 1, m = 0; i <= lengthB; i++, m++) {
                for (j = 1, n = 0; j <= lengthA; j++, n++) {
                    matrix[i][j] = b.charAt(m) === a.charAt(n)
                        ? matrix[m][n]
                        : Math.min(matrix[m][n] + 1, Math.min(matrix[i][n] + 1, matrix[m][j] + 1));
                }
            }

            result = (matrix[lengthB][lengthA] / lengthA) <= Key.MAX_STRING_DIFF_PERCENT;
        }

        return result;
    }
}
