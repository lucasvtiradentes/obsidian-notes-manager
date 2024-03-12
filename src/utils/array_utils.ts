export const groupObjectArrayByKey = <T extends object, K extends keyof T>(arr: T[], key: K): Record<string, T[]> => {
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const curKey = item[key] as any;
    if (!acc[curKey]) {
      acc[curKey] = [];
    }
    acc[curKey].push(item);
    return acc;
  }, {});
};

export const mergeArraysOfArrays = <T>(arr: T[][]): T[] => arr.reduce((acc, val) => acc.concat(val), []);

export function arrayToObjectEnum<T extends string>(arr: readonly [...T[]]) {
  return arr.reduce((obj, item) => ((obj[item] = item), obj), {} as { [K in T]: K });
}
