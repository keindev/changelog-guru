const MAX_DIFF_PERCENT = 0.2;
const MAX_DIFF_DISTANCE = 1;

export const unify = (key: string): string => key.trim().toLowerCase();

export const isSame = (a: string, b: string): boolean => {
    const ax = unify(a);
    const bx = unify(b);
    const { length: l1 } = ax;
    const { length: l2 } = bx;

    if (ax === bx) return true;
    if (Math.abs(l1 - l2) > MAX_DIFF_DISTANCE) return false;

    let i = 0;
    let j = 0;
    let m: number;
    let n: number;
    const mx: number[][] = [];
    const distance = (): number => Math.min(mx[m][n] + 1, Math.min(mx[i][n] + 1, mx[m][j] + 1));

    while (i <= l2) mx[i] = [i++];
    while (j <= l1) mx[0][j] = j++;

    for (i = 1, m = 0; i <= l2; i++, m++) {
        for (j = 1, n = 0; j <= l1; j++, n++) {
            mx[i][j] = bx.charAt(m) === ax.charAt(n) ? mx[m][n] : distance();
        }
    }

    return mx[l2][l1] <= MAX_DIFF_DISTANCE || mx[l2][l1] / l1 <= MAX_DIFF_PERCENT;
};

export const inArray = (key: string, list: string[]): boolean => list.some(item => isSame(key, item));

export const find = (key: string, list: string[]): string | undefined => list.find(item => isSame(item, key));

export const inMap = <T>(key: string, map: Map<string, T>): T | undefined => {
    return map.get(key) ?? map.get([...map.keys()].find(k => isSame(key, k)) ?? '');
};
