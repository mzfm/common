import { Utils } from "rmmz"

export const fsModule = (): typeof import("fs") => {
  if (!Utils.isNwjs()) {
    throw new Error("This command is only available in NW.js.")
  }
  return require("fs")
}

export const pathModule = (): typeof import("path") => {
  if (!Utils.isNwjs()) {
    throw new Error("This command is only available in NW.js.")
  }
  return require("path")
}

export const mkpath = (path: string): boolean => {
  if (!Utils.isNwjs()) return false
  const fs = fsModule()
  fs.mkdirSync(path, { recursive: true })
  return true
}
