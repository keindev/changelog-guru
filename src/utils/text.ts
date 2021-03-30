const MAX_DIFF_PERCENT = 0.2;
const MAX_DIFF_DISTANCE = 1;

export const unify = (key: string): string => key.trim().toLowerCase();

export const isSame = (a: string, b: string): boolean => {
  const ax = unify(a);
  const bx = unify(b);

  if (ax === bx) return true;
  if (Math.abs(ax.length - bx.length) > MAX_DIFF_DISTANCE) return false;

  let i = 0;
  let j = 0;
  let m: number;
  let n: number;
  const mx: number[][] = [];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const distance = (): number => Math.min(mx[m]![n]! + 1, Math.min(mx[i]![n]! + 1, mx[m]![j]! + 1));

  while (i <= bx.length) mx[i] = [i++];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  while (j <= ax.length) mx[0]![j] = j++;

  for (i = 1, m = 0; i <= bx.length; i++, m++) {
    for (j = 1, n = 0; j <= ax.length; j++, n++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mx[i]![j]! = (bx.charAt(m) === ax.charAt(n) ? mx[m]![n] : distance()) as number;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return mx[bx.length]![ax.length]! <= MAX_DIFF_DISTANCE || mx[bx.length]![ax.length]! / ax.length <= MAX_DIFF_PERCENT;
};

export const findSame = (key: string, items: string[]): string | undefined => items.find(item => isSame(item, key));
