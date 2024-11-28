export function memoize<T extends ((...args: unknown[]) => unknown)>(fn: T, tap?: (result: ReturnType<T>) => ReturnType<T>): T {
  const cache = new Map<string, ReturnType<T>>();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      let result = target.apply(thisArg, args);
      if (typeof tap === 'function') {
        result = tap(result);
      }
      cache.set(cacheKey, result);
      return result;
    }
  });
}
