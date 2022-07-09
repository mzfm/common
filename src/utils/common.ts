import { randomBytes } from "crypto"

export type MethodType<T, TKey extends keyof T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T[TKey] extends (this: T, ...args: any[]) => any ? T[TKey] : never

export const overrideMethod = <T, TKey extends keyof T>(
  obj: new (...args: never[]) => T,
  methodName: TKey,
  fn: (
    this: T,
    original: OmitThisParameter<MethodType<T, TKey>>,
    ...args: Parameters<MethodType<T, TKey>>
  ) => ReturnType<MethodType<T, TKey>>
) => {
  const original = obj.prototype[methodName] as MethodType<T, TKey>
  obj.prototype[methodName] = function (this: T, ...args: Parameters<MethodType<T, TKey>>) {
    return fn.call(this, original.bind(this) as OmitThisParameter<MethodType<T, TKey>>, ...args)
  }
}

// export const globalEval = <T>(code: string): T => eval(code) as T
export const globalEval = <T>(code: string): T => code as unknown as T

export const uuid = (): string => randomBytes(32).toString("hex")

export const waitUntil = (condition: () => boolean, period = 50): Promise<void> =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve()
      }
    }, period)
  })
