export const overrideMethod = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends { prototype: { [key: string]: (...args: any) => unknown } },
  TKey extends keyof T["prototype"]
>(
  obj: T,
  methodName: string,
  fn: (
    original: T["prototype"][TKey],
    ...args: Parameters<T["prototype"][TKey]>
  ) => ReturnType<T["prototype"][TKey]>
) => {
  const original = obj.prototype[methodName]
  obj.prototype[methodName] = function (
    this: T,
    ...args: Parameters<T["prototype"][TKey]>
  ) {
    return fn.call(this, original.bind(this) as T["prototype"][TKey], ...args)
  }
}
