import _ from "rmmz"

declare global {
  interface Array<T> {
    clone(): Array<T>
  }
  interface String {
    format(...args: unknown[]): string
  }
}

declare module "rmmz" {
  export class Game_Event {}
  export interface Game_Command {
    code: number
    index: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any[]
  }
  export class Game_Interpreter {
    public _list: Game_Command[]
    public _index: number
    public _indent: number
    public _branch: Record<number, number>
    public setup(list: Game_Command[], eventId: number): void
    public setupChoices(params: [string[], number, number, number, number]): void
  }
}
