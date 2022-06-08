import { Utils } from "rmmz"

export const isRM = (): boolean => Utils !== undefined
export const isNwjs = (): boolean => isRM() && Utils.isNwjs()
export const isLocalTest = (): boolean => isNwjs() && Utils.isOptionValid("test")
