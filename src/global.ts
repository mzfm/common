import { StorageManager } from "rmmz"
import { MZFMCommand, MZFMPlugin } from "./types"

declare global {
  // eslint-disable-next-line no-var
  var MZFM: {
    plugins: {
      [name: string]: MZFMPlugin<Record<string, unknown>, Record<string, MZFMCommand<unknown>>>
    }
    _globalVariables?: Record<string, unknown>
    [key: string]: unknown
  }
}

export const MZFM = globalThis.MZFM || {
  plugins: {},
}

if (!globalThis.MZFM) {
  globalThis.MZFM = MZFM
}

const MZFM_GLOBAL_FILENAME = "mzfm_globals"
const updateGlobalVariables = async (): Promise<Record<string, unknown>> => {
  try {
    MZFM._globalVariables = await StorageManager.loadObject(MZFM_GLOBAL_FILENAME)
  } catch {
    console.warn("No global variables found.")
  }
  if (!MZFM._globalVariables) {
    MZFM._globalVariables = {}
  }
  return MZFM._globalVariables
}

export const getGlobal = async <T>(key: string, force = false): Promise<T | undefined> => {
  const globalVariables =
    !MZFM._globalVariables || force ? await updateGlobalVariables() : MZFM._globalVariables
  return globalVariables[key] as T
}

export const getGlobalSync = <T>(key: string): T | undefined =>
  MZFM._globalVariables && (MZFM._globalVariables[key] as T)

export const setGlobal = async <T>(key: string, value: T, force = false) => {
  const globalVariables =
    !MZFM._globalVariables || force ? await updateGlobalVariables() : MZFM._globalVariables
  globalVariables[key] = value
  await StorageManager.saveObject(MZFM_GLOBAL_FILENAME, globalVariables)
  console.debug("Global variables updated.")
}
