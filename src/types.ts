import { Game_Interpreter } from "rmmz"

export interface MZFMInterpreter extends Game_Interpreter {
  _mzfmContexts?: Record<string, unknown>
}

// Context is local to the Game_Interpreter.
export interface MZFMCommand<T = Record<string, never>, TContext = unknown> {
  initialize?: (commandName: string) => void | Promise<void>
  run: (this: MZFMInterpreter, ctx: Partial<TContext>, args: T) => void | Promise<void>
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
  default_params: TParams
  commands: TCommands
  initialize?: () => void | Promise<void>
}
