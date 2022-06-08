import { Utils } from "rmmz"

export const isLocalTest = (): boolean => Utils.isNwjs() && Utils.isOptionValid("test")
