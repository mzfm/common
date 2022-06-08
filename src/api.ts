import { PluginManager, PluginParameters } from "rmmz"
import { MZFMCommand, MZFMInterpreter, MZFMPlugin } from "./types"
import { MZFM } from "./global"

export const _parse = (s: unknown): unknown => {
  if (typeof s === "string") {
    try {
      s = JSON.parse(s)
    } catch {
      return s
    }
  }
  if (typeof s !== "object") {
    return s
  }
  if (Array.isArray(s)) {
    return s.map(_parse)
  }
  const o = s as Record<string, unknown>
  Object.keys(o).forEach((key) => (o[key] = _parse(o[key])))
  return o
}
export const parseArgs = <T>(args: PluginParameters): T => _parse(args) as T

export const getContext = <T>(interpreter: MZFMInterpreter, key: string): Partial<T> => {
  const contexts = (interpreter._mzfmContexts = interpreter._mzfmContexts || {})
  const ctx = (contexts[key] = contexts[key] || {})
  return ctx as T
}

export const registerCommand = async <T>(pluginName: string, key: string, command: MZFMCommand<T>) => {
  console.debug(`Registering command: ${key}`)
  if (command.setGlobal) {
    if (MZFM[key]) {
      throw new Error(`Command ${key} already exists`)
    }
    MZFM[key] = command.run
  }
  try {
    if (command.initialize) {
      await command.initialize(key)
    }
    PluginManager.registerCommand(pluginName, key, function (this: MZFMInterpreter, args) {
      const ctx = getContext(this, key)
      command.run.call(this, ctx, command.skipParseArgs ? (args as unknown as T) : parseArgs(args))
    })
  } catch (e) {
    if (command.setGlobal) {
      delete MZFM[key]
    }
    throw e
  }
}

export const registerPlugin = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommands extends Record<string, MZFMCommand<any>>
>(
  plugin: MZFMPlugin<TParams, TCommands>
): Promise<void> => {
  const { name, commands } = plugin
  if (MZFM.plugins[name]) {
    console.debug(`Plugin ${name} already registered. Skipped.`)
    return
  }
  console.debug(`Registering plugin: ${name}`)
  try {
    for (const key in commands) {
      const command = commands[key]
      await registerCommand(name, key, command)
    }
    if (plugin.initialize) {
      await plugin.initialize()
    }
    MZFM.plugins[name] = plugin
    console.debug(`Plugin registered: ${name}`)
  } catch (e) {
    console.error(e)
    delete MZFM.plugins[name]
  }
}
