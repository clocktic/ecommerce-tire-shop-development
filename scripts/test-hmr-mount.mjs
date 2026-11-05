import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import ts from "typescript"

const require = createRequire(import.meta.url)
const { HMR_MESSAGE_SENT_TO_BROWSER } = require("next/dist/server/dev/hot-reloader-types")
const refreshEvents = ["SERVER_COMPONENT_CHANGES", "STATIC_PARAMS_CHANGED", "ADDED_PAGE", "REMOVED_PAGE"]

function loadHotReload(esm, turbopack) {
  const path = require.resolve(`next/dist/${esm ? "esm/" : ""}client/dev/hot-reloader/app/hot-reloader-app.js`)
  const source = readFileSync(path, "utf8")
  const code = esm ? ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText : source
  const effects = []
  const calls = []
  const noop = () => {}
  const runtime = { hadRuntimeError: false }
  const dependencies = {
    __esModule: true,
    default: noop,
    _: (value) => value,
    jsx: noop,
    jsxs: noop,
    useEffect: (effect) => effects.push(effect),
    startTransition: (callback) => callback(),
    useWebSocketPing: noop,
    useErrorHandler: noop,
    useUntrackedPathname: () => "/us/en",
    HMR_MESSAGE_SENT_TO_BROWSER,
    RuntimeErrorHandler: runtime,
    publicAppRouterInstance: { hmrRefresh: () => calls.push("refresh") },
    dispatcher: { onRefresh: () => calls.push("overlay") },
    TurbopackHmr: class {
      onServerComponentChanges() {}
      onPageAddRemove() {}
    },
  }
  const module = { exports: {} }
  runInNewContext(code, {
    module,
    exports: module.exports,
    require: () => dependencies,
    process: { env: { NODE_ENV: "development", TURBOPACK: turbopack ? "1" : "" } },
    window: { location: { reload: () => calls.push("reload") } },
    document: { documentElement: { id: "" } },
    console,
  }, { filename: path })
  const hotReload = module.exports
  return {
    calls,
    runtime,
    render: () => hotReload.default({}),
    commit: () => effects.splice(0).map((effect) => effect()),
    send: (event) => hotReload.processMessage({ type: HMR_MESSAGE_SENT_TO_BROWSER[event] }, noop, noop, {}),
  }
}

for (const esm of [false, true]) {
  for (const turbopack of [false, true]) {
    const label = `${esm ? "ESM" : "CommonJS"} / ${turbopack ? "Turbopack" : "webpack"}`
    test(`${label}: refreshes wait for commit, survive cleanup, and run only once`, () => {
      const hmr = loadHotReload(esm, turbopack)
      hmr.send(refreshEvents[0])
      hmr.render()
      for (const event of refreshEvents.slice(1)) hmr.send(event)
      assert.deepEqual(hmr.calls, [], "HMR must not update the router before its mount effect")
      const expected = ["refresh", "overlay", "refresh", "overlay", "refresh", "refresh"]
      const cleanups = hmr.commit()
      assert.deepEqual(hmr.calls, expected)
      hmr.send("SERVER_COMPONENT_CHANGES")
      expected.push("refresh", "overlay")
      assert.deepEqual(hmr.calls, expected, "Mounted routers should refresh immediately")
      for (const cleanup of cleanups) cleanup?.()
      hmr.send("STATIC_PARAMS_CHANGED")
      assert.deepEqual(hmr.calls, expected, "Refreshes must wait again after cleanup")
      hmr.render()
      hmr.commit()
      expected.push("refresh", "overlay")
      assert.deepEqual(hmr.calls, expected, "Remount must flush only newly queued refreshes")
    })
    test(`${label}: runtime errors still trigger a full reload`, () => {
      const hmr = loadHotReload(esm, turbopack)
      hmr.runtime.hadRuntimeError = true
      hmr.send("SERVER_COMPONENT_CHANGES")
      assert.deepEqual(hmr.calls, ["reload"])
    })
  }
}
