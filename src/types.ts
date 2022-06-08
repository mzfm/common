export interface MZFMCommand<T> {
  initialize: () => boolean | Promise<boolean>
  run: (args: T) => void | Promise<void>
  setGlobal?: boolean
  skipParseArgs?: boolean
}

export interface MZFMPlugin<
  TParams extends Record<string, unknown>,
  TCommands extends Record<string, unknown>
> {
  name: string
  params: TParams
  commands: TCommands
}
