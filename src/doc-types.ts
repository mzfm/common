import { MZFMCommand, MZFMPlugin } from "./types"

type ExtractArrayElement<T> = T extends (infer TElement)[] ? TElement : never
type ExtractCommandArgs<T> = T extends MZFMCommand<infer TArgs> ? TArgs : never
type ExtractPluginParams<T> = T extends MZFMPlugin<infer TParams, infer _TCommands> ? TParams : never
type ExtractPluginCommands<T> = T extends MZFMPlugin<infer _TParams, infer TCommands> ? TCommands : never

export interface PluginDocsParameter<T> {
  text?: string
  description?: string
  default?: T
  options?: {
    text: string
    value: T
  }[]
  required?: boolean
  dir?: string
  min?: number
  max?: number
  type:
    | "file"
    | "combo"
    | "select"
    | typeof Number
    | typeof Boolean
    | typeof String
    | [typeof Number | typeof Boolean | typeof String]
    | PluginStructDocs<T>
    | [PluginStructDocs<ExtractArrayElement<T>>]
}

export interface PluginStructDocs<T> {
  key: string
  fields: {
    [key in keyof T]: PluginDocsParameter<T[key]>
  }
}
export interface PluginCommandDocs<TCommand> {
  description?: string
  args: {
    [key in keyof ExtractCommandArgs<TCommand>]: PluginDocsParameter<ExtractCommandArgs<TCommand>[key]>
  }
}

export interface PluginDocs<TPlugin> {
  name: string
  projectName?: string
  title: string
  targets?: ("MZ" | "MV")[]
  description?: string
  author?: string
  basePluginName?: string
  orderAfters?: string[]
  url?: string
  params: {
    [key in keyof ExtractPluginParams<TPlugin>]: PluginDocsParameter<ExtractPluginParams<TPlugin>[key]> & {
      parent?: keyof PluginDocs<TPlugin>["params"]
    }
  } & {
    [key: string]: PluginDocsParameter<string>
  }
  commands: {
    [key in keyof ExtractPluginCommands<TPlugin>]: PluginCommandDocs<ExtractPluginCommands<TPlugin>[key]>
  }
  copyright?: string
  helpText?: string
}
