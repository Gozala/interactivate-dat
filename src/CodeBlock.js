// @flow strict

import { regex, re } from "./Data/RegExp.js"
import CodeMirror from "./codemirror.js"
import JSMODE from "./codemirror/mode/javascript/javascript.js"
import matchBrackets from "./codemirror/addon/edit/matchbrackets.js"
// import * as interactivate from "./codemirror-addon/interactivate.js"
import { idle } from "./io/scheduler.js"
import { never } from "./elm/basics.js"
JSMODE(CodeMirror)
matchBrackets(CodeMirror)
// interactivate.plugin(CodeMirror)

/*::
import type { Editor } from "./codemirror.js"

type EventType =
  | "changes"
  | "cursorActivity"


type Direction = -1 | 1
type Unit = "line" | "char"
*/

const fetchStyle = async path => {
  const styleSheet = await fetch(path)
  return await styleSheet.text()
}

const style = async () => {
  const [base, theme] = await Promise.all([
    fetchStyle("./src/codemirror/lib/codemirror.css"),
    fetchStyle("./theme.css")
  ])
  return `
  :host {
    outline: none;
    contain: content;
  }
  
  ${base}

  ${theme}
  `
}

// We use this hack to avoid layout junk caused by late
// style application.
const css = style()

class Options {
  /*::
  value:string
  readOnly:boolean
  tabSize:number
  mode:string
  lineNumbers:boolean
  styleActiveLine:?{nonEmpty:boolean}|boolean
  smartIndent:boolean
  indentWithTabs:boolean
  theme:string
  dragDrop:boolean
  extraKeys:{[string]:string|Function}
  viewportMargin: number
  matchBrackets:boolean
  interactivate:boolean
  */
  constructor() {
    this.value = ""
    this.readOnly = false
    this.tabSize = 2
    this.lineNumbers = false
    this.styleActiveLine = { nonEmpty: true }
    this.smartIndent = true
    this.indentWithTabs = false
    this.theme = "interactivate"
    this.mode = "text/javascript"
    this.dragDrop = false
    this.extraKeys = { "Ctrl-Space": "autocomplete" }
    this.viewportMargin = Infinity
    this.matchBrackets = true
    this.interactivate = true
  }
  get indentWidth() {
    return this.tabSize
  }
  get indentUnit() {
    return this.indentUnit
  }
  set indentUnit(_) {}
}

const BaseElement /*:typeof HTMLElement*/ = top.HTMLElement
export default class CodeBlock extends BaseElement {
  static define({ customElements } /*:window*/) {
    const element = customElements.get("code-block")
    if (element) {
      Object.setPrototypeOf(element.prototype, CodeBlock.prototype)
    } else {
      customElements.define(
        "code-block",
        class extends CodeBlock {
          constructor() {
            super()
            this.init()
          }
        }
      )
    }
  }
  /*::
  options:Options
  navigationKeys:Object
  editor:Editor
  onChanges:() => void
  onCursorActivity:() => void
  root:ShadowRoot
  Pass:mixed
  */
  init() {
    this.navigationKeys = this.navigationKeys || {
      Up: () => this.onPreviousLine(),
      Down: () => this.onNextLine(),
      Left: () => this.onPreviousChar(),
      Right: () => this.onNextChar(),
      Enter: () => this.onSplitLine()
    }

    this.root = this.attachShadow({ mode: "open", delegatesFocus: true })

    // this.addEventListener("focus", this)
    // this.addEventListener("blur", this)

    this.options = new Options()
    this.onChanges = idle.debounce(() => void this.receive("changes"))
    this.onCursorActivity = idle.debounce(
      () => void this.receive("cursorActivity")
    )
  }
  async connectedCallback() {
    const style = this.ownerDocument.createElement("style")
    style.textContent = await css
    this.root.appendChild(style)

    this.editor = CodeMirror(this.root, this.options)
    this.Pass = CodeMirror.Pass
    this.editor.setOption("extraKeys", this.navigationKeys)
    this.editor.on("changes", this.onChanges)
    this.editor.on("cursorActivity", this.onCursorActivity)

    if (this.ownerDocument.activeElement === this) {
      this.editor.focus()
    }
  }
  setSelection(dir /*:-1|1*/) {
    if (this.editor) {
      const doc = this.editor.getDoc()
      const line = dir > 0 ? doc.firstLine() : doc.lastLine()
      const ch = dir > 0 ? 0 : doc.getLine(line).length
      const position = { line, ch }
      doc.setSelection(position, position)
    }
  }
  onPreviousLine() {
    return this.maybeEscape("line", -1)
  }
  onNextLine() {
    return this.maybeEscape("line", 1)
  }
  onPreviousChar() {
    return this.maybeEscape("char", -1)
  }
  onNextChar() {
    return this.maybeEscape("char", 1)
  }
  onSplitLine() {
    const doc = this.editor.getDoc()
    const { line } = doc.getCursor()
    const lastLine = doc.lastLine()
    if (line === doc.lastLine()) {
      const content = doc.getLine(line)
      if (CELL_PATTERN.test(content)) {
        this.send("split")
        return Abort
      }
    }
    return this.Pass
  }
  /*::
  handleEvent:FocusEvent => mixed
  */
  handleEvent(event /*:FocusEvent*/) {
    switch (event.type) {
      case "focus": {
        return this.editor.focus()
      }
      case "blur": {
      }
    }
  }
  send(type /*:string*/, detail /*:any*/) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }
  receive(eventType /*:EventType*/) {
    switch (eventType) {
      case "changes": {
        this.syncValue()
        return this.send("change", this.options.value)
      }
      case "cursorActivity": {
        return this.send("settled", null)
      }
      default: {
        return never(eventType)
      }
    }
  }
  maybeEscape(unit /*: Unit*/, dir /*: Direction*/) {
    const doc = this.editor.getDoc()
    let pos = doc.getCursor()
    if (
      doc.somethingSelected() ||
      pos.line != (dir < 0 ? doc.firstLine() : doc.lastLine()) ||
      (unit == "char" && pos.ch != (dir < 0 ? 0 : doc.getLine(pos.line).length))
    ) {
      return this.Pass
    } else {
      this.send("escape", { unit, dir })
    }
  }
  syncValue() {
    const { options, editor } = this
    if (editor) {
      options.value = editor.getValue()
    }
  }
  setOption(name /*:string*/, value /*:mixed*/) {
    const { editor } = this
    if (editor) {
      editor.setOption(name, value)
    }
  }
  get source() {
    return this.options.value
  }
  set source(value /*:string*/) {
    if (value != null && value !== this.options.value) {
      this.options.value = value
      const { editor } = this
      if (editor) {
        const doc = editor.getDoc()
        const { left, top } = editor.getScrollInfo()
        const position = editor.getDoc().getCursor()
        editor.setValue(value)
        doc.setCursor(position)
        editor.scrollTo(left, top)
      }
    }
  }
  get readOnly() {
    return this.options.readOnly
  }
  set readOnly(value /*:boolean*/) {
    const { options } = this
    const readOnly = value == null ? false : true
    if (readOnly !== options.readOnly) {
      options.readOnly = readOnly
      this.setOption("readOnly", readOnly)
    }
  }
  get tabSize() {
    return this.options.tabSize
  }
  set tabSize(value /*:number*/) {
    const { options } = this
    const int = parseInt(value)
    const tabSize = Number.isNaN(int) ? 2 : int
    options.tabSize = tabSize
    this.setOption("indentWidth", tabSize)
    this.setOption("tabSize", tabSize)
    this.setOption("indentUnit", tabSize)
  }
}

const LabelHead = re`[A-Za-z_]`
const LabelTail = re`\w*`
const Spaces = re`\s*`
const Colon = re`\:`
const Rest = re`.*`
const CELL_PATTERN = regex`^(${LabelHead}${LabelTail}${Spaces}${Colon}${Rest})$``gm`

// const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*$)/gm
const Abort = undefined
