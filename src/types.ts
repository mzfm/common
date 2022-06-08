export interface MZFMCommand<T = Record<string, never>> {
  initialize: () => boolean | Promise<boolean>
  run: (args: T) => void | Promise<void>
  setGlobal?: boolean
  skipParseArgs?: boolean
}

export interface MZFMPlugin<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommands extends Record<string, MZFMCommand<any>>
> {
  name: string
  params: TParams
  commands: TCommands
}
