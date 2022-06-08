import { isNwjs } from "./engine"

export const fs: typeof import("fs") = isNwjs() ? require("fs") : null
export const path: typeof import("path") = isNwjs() ? require("path") : null

export const mkpath = (path: string): boolean => {
  if (!isNwjs()) return false
  fs.mkdirSync(path, { recursive: true })
  return true
}

export const readFile = async (path: string): Promise<string | undefined> => {
  try {
    if (isNwjs()) {
      return await new Promise((resolve, reject) =>
        fs.readFile(path, "utf8", (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      )
    }
    const res = await fetch(path)
    return await res.text()
  } catch (e) {
    console.warn("File load error:", e)
    return undefined
  }
}
