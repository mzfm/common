#!/bin/env node

import path from "path"
import fs from "fs"

import chokidar from "chokidar"
import { program } from "commander"
import esbuild, { BuildOptions } from "esbuild"
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals"

import {
  PluginCommandDocs,
  PluginDocs,
  PluginDocsParameter,
  PluginStructDocs,
} from ".."

const findProjectDir = (dir: string): string | null => {
  if (dir === "/") {
    return null
  }
  const filename = path.join(dir, "package.json")
  if (fs.existsSync(filename)) {
    return dir
  }
  return findProjectDir(path.dirname(dir))
}

const makeComments = (
  lines: string | string[] | undefined,
  title = ""
): string | undefined => {
  if (!lines) {
    return undefined
  }
  if (typeof lines === "string") {
    lines = lines.split("\n")
  }
  return `/*${title}
${lines.map((line) => ` * ${line}`).join("\n")}
 */`
}

const updateDocs = (
  docs: string[],
  key: string,
  value?: unknown,
  stringify = false
) => {
  if (value) {
    docs.push(`@${key} ${stringify ? JSON.stringify(value) : value}`)
  }
}

const getType = <T>(
  type: PluginDocsParameter<T>["type"],
  structs: Record<string, PluginStructDocs<unknown>>
): string => {
  if (typeof type === "string") {
    return type
  }
  const isArray = Array.isArray(type)
  if (isArray) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type = (type as any[])[0]
  }
  switch (type) {
    case Number:
      return isArray ? "number[]" : "number"
    case Boolean:
      return isArray ? "boolean[]" : "boolean"
    case String:
      return isArray ? "string[]" : "string"
  }
  const struct = type as PluginStructDocs<unknown>
  const key = struct.key
  if (!structs[key]) {
    structs[key] = struct
  }
  return `struct<${key}>${isArray ? "[]" : ""}`
}

const addParams = (
  docs: string[],
  params: Record<string, PluginDocsParameter<unknown>> | undefined,
  structs: Record<string, PluginStructDocs<unknown>>,
  paramKey = "param",
  parent?: string
) => {
  if (!params) return
  for (const key in params) {
    const param = params[key]
    updateDocs(docs, paramKey, key)
    updateDocs(docs, "text", param.text)
    updateDocs(docs, "parent", parent)
    updateDocs(docs, "desc", param.description)
    const type = getType(param.type, structs)
    updateDocs(docs, "type", type)
    if (param.options) {
      for (const option of param.options) {
        updateDocs(docs, "option", option.text)
        updateDocs(docs, "value", option.value, true)
      }
    }
    updateDocs(docs, "default", param.default, true)
    updateDocs(docs, "require", param.required ? "1" : "")
    updateDocs(docs, "dir", param.dir)
    updateDocs(docs, "min", param.min)
    updateDocs(docs, "max", param.max)
    docs.push("")
    addParams(docs, param.children, structs, key)
  }
}

const addCommands = (
  docs: string[],
  commands: Record<string, PluginCommandDocs<unknown>> | undefined,
  structs: Record<string, PluginStructDocs<unknown>>
) => {
  if (!commands) return
  for (const key in commands) {
    const command = commands[key]
    updateDocs(docs, "command", key)
    updateDocs(docs, "desc", command.description)
    docs.push("")
    addParams(docs, command.args, structs, "arg")
  }
}

const makeStructDocs = (
  structs: Record<string, PluginStructDocs<unknown>>
): (string | undefined)[] => {
  const keys = Object.keys(structs)
  if (keys.length === 0) return []
  const result: (string | undefined)[] = []
  const newStructs: Record<string, PluginStructDocs<unknown>> = {}
  for (const key of keys) {
    const struct = structs[key]
    const docs: string[] = [""]
    addParams(docs, struct.fields, newStructs)
    result.push(makeComments(docs, `~struct~${key}:`))
  }
  result.push(...makeStructDocs(newStructs))
  return result
}

const makeDocs = <T>(project: PluginDocs<T>): (string | undefined)[] => {
  const docs: string[] = [""]
  updateDocs(docs, "plugindesc", project.description)
  updateDocs(docs, "author", project.author)
  updateDocs(docs, "target", project.targets ? project.targets.join(" ") : "MZ")
  updateDocs(docs, "url", project.url)
  updateDocs(docs, "base", project.basePluginName)
  if (project.orderAfters) {
    for (const orderAfter of project.orderAfters) {
      updateDocs(docs, "orderAfter", orderAfter)
    }
  }
  docs.push("")
  if (project.helpText) {
    docs.push("@help")
    for (const line of project.helpText.split("\n")) {
      docs.push(line)
    }
  }
  const structs: Record<string, PluginStructDocs<unknown>> = {}
  addParams(docs, project.params, structs)
  addCommands(docs, project.commands, structs)
  const structDocs = makeStructDocs(structs)

  return [makeComments(docs, ":"), ...structDocs]
}

const main = async () => {
  program
    .description("Builds a plugin for RPG Maker MZ")
    .option("-w, --watch", "Watch for changes and rebuild")
    .option("--copyto <path>", "Copy the plugin to the specified path")
    .parse(process.argv)
  const opts = program.opts()
  const projectDir = findProjectDir(process.cwd())
  if (projectDir === null) {
    console.error("Could not find project directory")
    process.exit(1)
  }

  const packageJson = await import(path.join(projectDir, "package.json"))

  const projectName = packageJson.name

  const docsfile = path.join(projectDir, "dist", "docs.js")
  const buildOptions: BuildOptions = {
    entryPoints: [path.join(projectDir, "src", "index.ts")],
    bundle: true,
    watch: false,
    target: "esnext",
    external: ["rmmz"],
    plugins: [
      globalExternals({
        rmmz: {
          varName: "window",
          type: "cjs",
        },
      }),
    ],
  }
  const docsBuildOptions: BuildOptions = Object.assign({}, buildOptions, {
    entryPoints: [path.join(projectDir, "src", "docs.ts")],
    outfile: docsfile,
    format: "cjs",
    plugins: [
      globalExternals({
        rmmz: {
          varName: "{}",
          type: "cjs",
        },
      }),
    ],
  })
  const build = async () => {
    console.log(`Building plugin for project ${projectName}`)

    // Build docs
    await esbuild.build(docsBuildOptions)
    const project = (await import(docsfile)).default as PluginDocs<unknown>
    const docs: (string | undefined)[] = [
      makeComments(project.copyright),
      ...makeDocs(project),
    ]

    const outfile = path.join(
      projectDir,
      "dist",
      `${project.name.replace("/", "-")}.js`
    )
    buildOptions.outfile = outfile
    buildOptions.banner = {
      js: docs.filter((x) => x !== undefined).join("\n\n") + "\n",
    }

    await esbuild.build(buildOptions)
    console.log(`Plugin bundled in ${outfile}`)
    const copyTo = opts.copyto
    if (copyTo) {
      console.log(`Copying plugin to ${copyTo}`)
      fs.copyFileSync(outfile, path.join(copyTo, path.basename(outfile)))
    }
  }
  try {
    await build()
  } catch (e) {
    console.error(e)
  }
  const watch = opts.watch
  if (watch) {
    console.log("Watching for changes...")
    const watcher = chokidar.watch([path.join(projectDir, "src")])
    watcher.on("change", async () => {
      try {
        await build()
      } catch (e) {
        console.error(e)
      }
    })
  }
}

main()
