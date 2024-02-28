import deepmerge from 'deepmerge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayMerge = (target: any[], source: any[], options: deepmerge.ArrayMergeOptions): any[] => {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (destination[index] === undefined) destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    else if (options.isMergeableObject(item!)) destination[index] = deepmerge(target[index], item, options);
    else if (target.indexOf(item) < 0) destination.push(item);
  });

  return destination;
};
