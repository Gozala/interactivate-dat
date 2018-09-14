// @flow strict

import { future } from "../../elm/Future.js"
import { send, request } from "../../io/worker.js"

class Sandbox {
  /*::
  eval:string => mixed
  */
  constructor(window /*:typeof window*/) {
    this.eval = window.eval("{ (function(code) { return eval(code) }); }")
  }
}

const evaluateModule = (id, code) =>
  new Promise((resolve, reject) => {
    const handleEvent = event => {
      const { target, type } = event
      target.onerror = null
      target.onload = null
      target.remove()
      URL.revokeObjectURL(target.src)
      target.src = ""

      switch (type) {
        case "load": {
          return resolve(window[id])
        }
        case "error": {
          return reject(event)
        }
      }
    }

    const { document } = window
    const script = document.createElement("script")
    script.id = id
    script.defer = "defer"
    script.type = "module"
    script.onload = handleEvent
    script.onerror = handleEvent
    const blob = new Blob([code], {
      type: "text/javascript"
    })
    script.src = URL.createObjectURL(blob)

    document.head.appendChild(script)
  })

const generateAccessor = name =>
  `${name}:{configurable:true,enumerable:true,get(){return ${name}},set(){${name}=arguments[0]}}`

const generateBindings = ({ bindings, globals, labels }) => {
  const allowedGlobals = new Set(globals)
  allowedGlobals.delete("undefined")

  let accessors = [...bindings, ...allowedGlobals].map(generateAccessor)
  return `;Object.defineProperties(window, {${accessors.join(",")}});`
}
export const evaluate = future(async (id /*:string*/, code /*:string*/) => {
  const scope = await analyze(code)
  const bindings = generateBindings(scope)
  const index = Math.max(code.lastIndexOf("\n"), 0)
  const body = code.slice(0, index)
  const printExpression = code.slice(code.indexOf(":", index) + 1)
  const source = `${body}\nwindow["${id}"]=${printExpression}\n${bindings}`
  return await evaluateModule(id, source)
})

export const setSelection = future(async (id, dir) => {
  const target = document.getElementById(id)
  if (target && target.localName === "code-block") {
    const codeBlock /*:Object*/ = target
    codeBlock.focus()
    codeBlock.setSelection(dir)
  } else {
    throw Error(`<code-block/> with id ${id} was not found`)
  }
})

const analyzer = new URL(
  "./src/interactivate/Worker/analyzer.js",
  location.href
)
export const analyze = future(async source => request(analyzer, source))
