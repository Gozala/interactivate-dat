// @flow strict

import { idle } from "../Effect/scheduler.js"
/*::
import type {CodeMirror, Editor} from "../codemirror"
*/

export const plugin = (Editor /*:CodeMirror*/) => {
  const UntypedEditor /*:any*/ = Editor
  UntypedEditor.prototype.constructor = Editor
  UntypedEditor.defaults.interactiveSpeed = 300
  UntypedEditor.defaults.interactiveSeparator = /^\/\/ \=\>[^\n]*$/m
  UntypedEditor.defaults.interactiveSection = "\n// =>\n"
  // UntypedEditor.keyMap.macDefault["Cmd-Enter"] = display
  // UntypedEditor.keyMap.pcDefault["Ctrl-Enter"] = display

  Editor.defineOption("interactivate", false, tooglePlugin)
}

const tooglePlugin = (editor, value) => {
  if (value) {
    editor.on("change", renderOutput)
    editor.on("cursorActivity", hideOutput)
    // window.addEventListener("client", editor[Reciever], false)
  } else {
    editor.off("change", renderOutput)
    editor.off("cursorActivity", hideOutput)
    // window.removeEventListener("client", editor[Reciever], false)
    // editor[Reciever] = null
    // editor[In] = null
    // editor[Out] = null
  }
}

// Function finds modified sections and queues up messegase to an
// eval host. In adition it also renders output views (if they
// do not exist yet) where eval results are written.
const renderOutput = idle.debounce(editor => {
  // var delta = calculate(editor)
  // var changes = Object.keys(delta).reduce(function(changes, id) {
  //   var change = delta[id]
  //   // Only mark change pending if there is some input to be evaled.
  //   if (change && change.input) change.pending = true
  //   return changes
  // }, delta)

  // write(editor, changes)
  // post(changes)
  const doc = editor.getDoc()
  const content = doc.getValue()
  const cells = tokenizeCells(content)
  let offset = 0
  for (const cell of cells) {
    offset += cell.lineCount
    const element = top.document.createElement("hr")
    const widget = doc.addLineWidget(offset, element, {
      handleMouseEvents: false
    })
  }
})

const hideOutput = idle.debounce((editor /*:Editor*/) => {
  const position = editor.getDoc().getCursor()
  // // var state = editor[In]
  // var changes = Object.keys(state).reduce(function(delta, id) {
  //   var value = state[id]
  //   if (value.line === line) delta[id] = { visible: false }
  //   else if (!value.visible) delta[id] = { visible: true, line: value.line }

  //   return delta
  // }, [])

  // if (changes.length) write(editor, changes)
})

class Slice {
  /*::
  source:string
  offset:number
  length:number
  cachedContent:?string
  cachedLineCount:?number
  */
  constructor(source, offset, length) {
    this.source = source
    this.offset = offset
    this.length = length
    this.cachedContent = null
    this.cachedLineCount = null
  }
  get lineCount() {
    const { cachedLineCount } = this
    if (cachedLineCount) {
      return cachedLineCount
    } else {
      const { content } = this
      const match = content.match(NEW_LINE)
      const lineCount = match ? match.length : 0
      this.cachedLineCount = lineCount
      return lineCount
    }
  }
  get content() {
    const { cachedContent, source } = this
    if (cachedContent) {
      return cachedContent
    } else {
      const content = source.substr(this.offset, this.length)
      this.cachedContent = content
      return content
    }
  }
  get end() {
    return this.offset + this.length
  }
}

const tokenizeCells = code => {
  const slices = []
  let result = null
  let offset = 0
  while ((result = CELL_PATTERN.exec(code))) {
    const codeFragment = code.slice(offset, result.index) + result[0]
    const slice = new Slice(
      code,
      offset,
      result.index - offset + result[0].length
    )
    slices.push(slice)
    offset += slice.length
  }
  return slices
}

const NEW_LINE = /\r?\n|\r(?!\n)/g
const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*\r?\n|\r(?!\n))/gm
