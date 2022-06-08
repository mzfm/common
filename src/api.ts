import { PluginManager, PluginParameters } from "rmmz"
import { MZFMCommand, MZFMPlugin } from "./types"
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

export const registerCommand = async <T>(
  pluginName: string,
  key: string,
  command: MZFMCommand<T>
) => {
  console.debug(`Registering command: ${key}`)
  if (command.setGlobal) {
    if (MZFM[key]) {
      throw new Error(`Command ${key} already exists`)
    }
    MZFM[key] = command.run
  }
  try {
    if (command.initialize && !(await command.initialize())) {
      throw new Error(`Command ${key} failed to initialize`)
    }
    PluginManager.registerCommand(
      pluginName,
      key,
      function (this: unknown, args) {
        command.run.call(
          this,
          command.skipParseArgs ? (args as unknown as T) : parseArgs(args)
        )
      }
    )
  } catch (e) {
    if (command.setGlobal) {
      delete MZFM[key]
    }
    throw e
  }
}

export const registerPlugin = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommands extends Record<string, MZFMCommand<any>>
>(
  plugin: MZFMPlugin<TParams, TCommands>
): void => {
  const { name, commands } = plugin
  if (MZFM.plugins[name]) {
    console.debug(`Plugin ${name} already registered. Skipped.`)
    return
  }
  console.debug(`Registering plugin: ${name}`)
  try {
    for (const key in commands) {
      const command = commands[key]
      registerCommand(name, key, command)
    }
    MZFM.plugins[name] = plugin
    console.debug(`Plugin registered: ${name}`)
  } catch (e) {
    console.error(e)
    delete MZFM.plugins[name]
  }
}
