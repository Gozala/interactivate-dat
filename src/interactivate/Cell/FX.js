// @flow strict

import { future } from "../../elm/Future.js"

class Sandbox {
  /*::
  eval:string => mixed
  */
  constructor(window /*:typeof window*/) {
    this.eval = window.eval("{ (function(code) { return eval(code) }); }")
  }
}

export const evaluate = future(async (id, code) => {
  const sandbox = window.sandbox || (window.sandbox = new Sandbox(window))
  const name = `cell${id}`
  let result
  try {
    result = sandbox.eval(code)
  } catch (error) {
    result = error
  }
  window[name] = result

  return result
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
