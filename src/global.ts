import { MZFMPlugin } from "./types"

declare global {
  // eslint-disable-next-line no-var
  var MZFM: {
    plugins: {
      [name: string]: MZFMPlugin<
        Record<string, unknown>,
        Record<string, unknown>
      >
    }
    [key: string]: unknown
  }
}

export const MZFM = globalThis.MZFM || {
  plugins: {},
}

if (!globalThis.MZFM) {
  globalThis.MZFM = MZFM
}
