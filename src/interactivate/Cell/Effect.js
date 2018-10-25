// @flow strict

import { future } from "../../elm/Future.js"
import { send, request } from "../../io/worker.js"

class Sandbox {
  /*::
  lastID:number
  resolve:mixed => void
  reject:mixed => void
  script:HTMLScriptElement
  handleEvent:Event => mixed
  */
  constructor() {
    this.lastID = 0
  }
  evaluate(id, code) {
    const { document } = window
    const script = document.createElement("script")
    script.id = id
    script.defer = "defer"
    script.type = "module"
    script.addEventListener("error", this)
    script.addEventListener("evaluated", this)
    window.addEventListener("error", this)

    window[id] = (value, bindings) =>
      script.dispatchEvent(
        new CustomEvent("evaluated", {
          detail: { value, bindings }
        })
      )
    // const blob = new Blob([code], {
    //   type: "text/javascript"
    // })
    // script.src = URL.createObjectURL(blob)
    script.textContent = code
    this.script = script

    document.head.appendChild(script)
    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
  return(value) {
    const { resolve } = this
    resolve(value)
    this.finally()
  }
  throw(value) {
    const { reject } = this
    reject(value)
    this.finally()
  }

  finally() {
    const { script } = this
    script.removeEventListener("evaluated", this)
    script.removeEventListener("error", this)
    window.removeEventListener("error", this)
    script.remove()
    // URL.revokeObjectURL(script.src)
    // script.src = ""
    delete window[script.id]
    delete this.script
    delete this.resolve
    delete this.reject
  }
  handleEvent(event) {
    const { script } = this
    switch (event.target) {
      case window: {
        if (event.type === "error" /*&& event.filename === script.src*/) {
          return this.throw(event.error)
        }
        break
      }
      case script: {
        switch (event.type) {
          case "error": {
            return this.throw(event.error)
          }
          case "evaluated": {
            return this.return(event.detail)
          }
        }
        break
      }
    }
  }
}

const sandbox = new Sandbox()

const generateAccessor = name =>
  `${name}:{configurable:true,enumerable:true,get(){return ${name}},set(ø){${name}=ø}}`

const generateBindings = ({ bindings, globals, labels }) => {
  const accessors = []
  for (const name of [...bindings]) {
    const descriptor = Object.getOwnPropertyDescriptor(window, name)
    if (descriptor == null || descriptor.configurable) {
      accessors.push(generateAccessor(name))
    }
  }

  return `{${accessors.join(",")}}`
}

let lastEvalindex = 0

export const evaluate = future(async (id /*:string*/, code /*:string*/) => {
  const evalID = `ø${++lastEvalindex}${Date.now().toString(32)}`
  const index = Math.max(code.lastIndexOf("\n"), 0)
  const expression = code.slice(code.indexOf(":", index) + 1).trim()
  const source = `${code.slice(0, index)}\n`

  const result /*:any*/ = await analyze(code)
  if (result.error) {
    switch (result.error.name) {
      case "SyntaxError": {
        throw (window[id] = new SyntaxError(result.error.message))
      }
      default: {
        throw (window[id] = new Error(result.error))
      }
    }
  } else {
    const sourceURL = `\n//# sourceURL=./eval.js`
    const refs = generateBindings(result.ok)
    const code = `${source};${evalID}(${expression},${refs})${sourceURL}`
    const { bindings, value } = await sandbox.evaluate(evalID, code)
    Object.defineProperties(window, bindings)
    return value
  }
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

const analyzer = new URL("/src/interactivate/Worker/analyzer.js", location.href)
const analyze = source => request(analyzer, source)
