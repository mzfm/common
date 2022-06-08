export type MethodType<T, TKey extends keyof T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T[TKey] extends (this: T, ...args: any[]) => any ? T[TKey] : never

export const overrideMethod = <T, TKey extends keyof T>(
  obj: new () => T,
  methodName: TKey,
  fn: (
    original: OmitThisParameter<MethodType<T, TKey>>,
    ...args: Parameters<MethodType<T, TKey>>
  ) => ReturnType<MethodType<T, TKey>>
) => {
  const original = obj.prototype[methodName] as MethodType<T, TKey>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(obj.prototype[methodName] as any) = function (this: T, ...args: Parameters<MethodType<T, TKey>>) {
    return fn.call(this, original.bind(this) as OmitThisParameter<MethodType<T, TKey>>, ...args)
  }
}
