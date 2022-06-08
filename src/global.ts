import { StorageManager } from "rmmz"
import { MZFMCommand, MZFMPlugin } from "./types"

declare global {
  // eslint-disable-next-line no-var
  var MZFM: {
    plugins: {
      [name: string]: MZFMPlugin<Record<string, unknown>, Record<string, MZFMCommand<unknown>>>
    }
    _globalVariables: Record<string, Record<string, unknown>>
    [key: string]: unknown
  }
}

export const MZFM = globalThis.MZFM || {
  plugins: {},
  _globalVariables: {},
}

if (!globalThis.MZFM) {
  globalThis.MZFM = MZFM
}

const MZFM_GLOBAL_FILENAME = "mzfm_globals"
const updateGlobalVariables = async (namespace: string): Promise<Record<string, unknown>> => {
  try {
    MZFM._globalVariables[namespace] = await StorageManager.loadObject(namespace)
  } catch {
    console.warn("No global variables found.")
  }
  if (!MZFM._globalVariables[namespace]) {
    MZFM._globalVariables[namespace] = {}
  }
  return MZFM._globalVariables[namespace]
}

export const getGlobal = async <T>(
  key: string,
  { namespace = MZFM_GLOBAL_FILENAME, force = false } = {}
): Promise<T | undefined> => {
  const globalVariables =
    !MZFM._globalVariables[namespace] || force
      ? await updateGlobalVariables(namespace)
      : MZFM._globalVariables[namespace]
  return globalVariables[key] as T
}

export const getGlobalSync = <T>(key: string, namespace = MZFM_GLOBAL_FILENAME): T | undefined =>
  MZFM._globalVariables[namespace] && (MZFM._globalVariables[namespace][key] as T)

export const setGlobal = async <T>(
  key: string,
  value: T,
  { namespace = MZFM_GLOBAL_FILENAME, force = false } = {}
) => {
  const globalVariables =
    !MZFM._globalVariables[namespace] || force
      ? await updateGlobalVariables(namespace)
      : MZFM._globalVariables[namespace]
  globalVariables[key] = value
  await StorageManager.saveObject(namespace, globalVariables)
  console.debug("Global variables updated.")
}
