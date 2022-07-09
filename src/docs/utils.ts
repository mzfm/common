import { PluginDocsParameter } from "./types"

export const docsEnabled = (
  text: string,
  description = "Enabled",
  defaultValue = true
): PluginDocsParameter<"Enabled" | "Disabled"> => ({
  text,
  description,
  type: "select",
  default: defaultValue ? "Enabled" : "Disabled",
  options: ["Enabled", "Disabled"],
})

export const docs = (
  text: string,
  description: string,
  defaultValue?: string
): PluginDocsParameter<string> => ({
  text,
  description,
  default: defaultValue,
})
