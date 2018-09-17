// @flow strict

import { future } from "../../elm/Future.js"
import { send, request } from "../../io/worker.js"

class Sandbox {
  /*::
  resolve:mixed => void
  reject:mixed => void
  script:HTMLScriptElement
  handleEvent:Event => mixed
  */
  evaluate(id, code) {
    const { document } = window
    const script = document.createElement("script")
    script.id = id
    script.defer = "defer"
    script.type = "module"
    script.addEventListener("load", this)
    script.addEventListener("error", this)
    window.addEventListener("error", this)
    const blob = new Blob([code], {
      type: "text/javascript"
    })
    script.src = URL.createObjectURL(blob)
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
    script.removeEventListener("load", this)
    script.removeEventListener("error", this)
    window.removeEventListener("error", this)
    script.remove()
    URL.revokeObjectURL(script.src)
    script.src = ""
    delete this.script
    delete this.resolve
    delete this.reject
  }
  handleEvent(event) {
    const { script } = this
    switch (event.target) {
      case window: {
        if (event.type === "error" && event.filename === script.src) {
          return this.throw((window[script.id] = event.error))
        }
      }
      case script: {
        switch (event.type) {
          case "load": {
            return this.return(window[script.id])
          }
          case "error": {
            return this.throw((window[script.id] = event))
          }
        }
      }
    }
  }
}

const sandbox = new Sandbox()

const generateAccessor = name =>
  `${name}:{configurable:true,enumerable:true,get(){return ${name}},set(){${name}=arguments[0]}}`

const generateBindings = ({ bindings, globals, labels }) => {
  const accessors = []
  for (const name of [...bindings]) {
    const descriptor = Object.getOwnPropertyDescriptor(window, name)
    if (descriptor == null || descriptor.configurable) {
      accessors.push(generateAccessor(name))
    }
  }

  return `;Object.defineProperties(window, {${accessors.join(",")}});`
}
export const evaluate = future(async (id /*:string*/, code /*:string*/) => {
  const index = Math.max(code.lastIndexOf("\n"), 0)
  const expression = code.slice(code.indexOf(":", index) + 1)
  const source = `${code.slice(0, index)}\nwindow["${id}"]=${expression}`

  const result /*:any*/ = await analyze(source)
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
    const bindings = generateBindings(result.ok)
    return await sandbox.evaluate(id, `${source};${bindings}`)
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
