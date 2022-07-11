import { Game_Interpreter, PluginManager } from "rmmz"
import { parseArgs } from "./api"

export interface MZFMInterpreter extends Game_Interpreter {
  _mzfmContexts?: Record<string, unknown>
}

// Context is local to the Game_Interpreter.
export interface MZFMCommand<T = Record<string, never>, TContext = unknown> {
  initialize?: (key: string) => void | Promise<void>
  run: (this: MZFMInterpreter, args: T, ctx: Partial<TContext>) => void | Promise<void>
  skipParseArgs?: boolean
}

export class MZFMPlugin<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends Readonly<Record<string, any>> = Readonly<Record<string, any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommands extends Record<string, MZFMCommand<any>> = Record<string, MZFMCommand<any>>
> {
  private _params?: TParams
  constructor(
    public name: string,
    public commands: TCommands,
    public initialize?: () => void | Promise<void>
  ) {}

  public get actualName(): string {
    const { name } = this
    const p = $plugins.filter((p) => p.description.includes(`[${name}]`))[0]
    return p ? p.name : name
  }

  get params(): TParams {
    return this._params || (this._params = parseArgs<TParams>(PluginManager.parameters(this.actualName)))
  }
}
