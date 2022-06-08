export const overrideMethod = <
  T extends { prototype: { [key: string]: (...args: unknown[]) => unknown } },
  TKey extends keyof T["prototype"]
>(
  obj: T,
  methodName: string,
  fn: (
    original: T["prototype"][TKey],
    ...args: unknown[]
  ) => ReturnType<T["prototype"][TKey]>
) => {
  const original = obj.prototype[methodName]
  obj.prototype[methodName] = function (this: T, ...args: unknown[]) {
    return fn.call(this, original.bind(this) as T["prototype"][TKey], ...args)
  }
}
