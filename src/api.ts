import { PluginManager, PluginParameters, Scene_Boot } from "rmmz"
import { MZFMCommand, MZFMInterpreter, MZFMPlugin } from "./types"
import { MZFM } from "./global"
import { overrideMethod } from "./utils"

export const _parse = (s: unknown): unknown => {
  if (typeof s === "string" && s.length > 0) {
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

export const getContext = <T>(interpreter: MZFMInterpreter, ...keys: string[]): Partial<T> => {
  const key = keys.join(":")
  const contexts = (interpreter._mzfmContexts = interpreter._mzfmContexts || {})
  const ctx = (contexts[key] = contexts[key] || {})
  return ctx as T
}

export const registerCommand = async <T>(pluginName: string, key: string, command: MZFMCommand<T>) => {
  console.debug(`Registering command: ${key}`)
  if (command.initialize) {
    await command.initialize(`${pluginName}:${key}`)
  }
  PluginManager.registerCommand(pluginName, key, async function (this: MZFMInterpreter, args) {
    const ctx = getContext(this, pluginName, key)
    await command.run.call(this, command.skipParseArgs ? (args as unknown as T) : parseArgs(args), ctx)
  })
}

export const registerPlugin = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommands extends Record<string, MZFMCommand<any>>
>(
  plugin: MZFMPlugin<TParams, TCommands>
): Promise<void> => {
  let ready = false
  // Wait in Scene_Boot for the plugin to be ready
  overrideMethod(Scene_Boot, "isReady", (original) => ready && original())
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
      await plugin.initialize.call(plugin)
    }
    MZFM.plugins[name] = plugin
    console.debug(`Plugin registered: ${name}`)
  } catch (e) {
    console.error(e)
    delete MZFM.plugins[name]
  }
  ready = true
}
