// @flow strict

import CodeMirror from "./codemirror/src/codemirror.js"
import JSMODE from "./codemirror/mode/javascript/javascript.js"
JSMODE(CodeMirror)

const css = `@import url(./src/codemirror/lib/codemirror.css);
@import url(./theme.css);
`

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
  }
  get indentWidth() {
    return this.tabSize
  }
  get indentUnit() {
    return this.indentUnit
  }
}

const debounce = perform => {
  let cancel = null
  const run = () => {
    cancel = null
    perform()
  }

  return () => {
    if (cancel != null) {
      top.cancelIdleCallback(cancel)
    }
    cancel = top.requestIdleCallback(run)
  }
}

const BaseElement /*:typeof HTMLElement*/ = top.HTMLElement
export default class CodeBlock extends BaseElement {
  static define({ customElements } /*:window*/) {
    const element = customElements.get("code-block")
    if (element) {
      Object.defineProperty(element, "prototype", {
        value: CodeBlock.prototype,
        configurable: true
      })
    } else {
      customElements.define("code-block", CodeBlock)
    }
  }
  /*::
  options:Options
  editor:CodeMirror
  onChanges:() => void
  onCursorActivity:() => void
  */
  constructor() {
    super()
    this.init()
  }
  init() {
    const root = this.attachShadow({ mode: "open" })

    const style = document.createElement("style")
    style.textContent = css
    root.appendChild(style)

    this.options = new Options()
    this.onChanges = debounce(() => this.receive("changes"))
    this.onCursorActivity = debounce(() => this.receive("cursorActivity"))
  }

  connectedCallback() {
    this.editor = CodeMirror(this.shadowRoot, this.options)
    this.editor.on("changes", this.onChanges)
    this.editor.on("cursorActivity", this.onCursorActivity)
  }
  receive(eventType /*:string*/) {
    switch (eventType) {
      case "changes": {
        this.syncValue()
        return this.dispatchEvent(
          new CustomEvent("change", { detail: this.options.value })
        )
      }
      case "cursorActivity": {
        return this.dispatchEvent(new CustomEvent("settled"))
      }
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
        const { left, top } = editor.getScrollInfo()
        editor.setValue(value)
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

// const m = v => document.createElement(v)
// const sel = v => document.querySelector(v)

// class CustomElement extends HTMLElement {
//   constructor(opts) {
//     super()
//     this.shadow = this.attachShadow({ mode: "open" })
//     this.opts = opts || {}
//     this.render()
//   }

//   render() {
//     var title = m("h2")
//     title.textContent = this.opts.title || "default title"
//     this.shadow.append(title)

//     var desc = m("p")
//     desc.textContent = this.opts.desc || "default desc"
//     this.shadow.append(desc)
//   }
// }

// customElements.define("custom-element", CustomElement)
