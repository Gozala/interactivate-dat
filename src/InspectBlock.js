// @flow strict

import { idle } from "./io/scheduler.js"
import { never } from "./elm/basics.js"
import { Inspector } from "./@observablehq/notebook-inspector.js"

export default class InpectBlock extends HTMLElement {
  static define({ customElements } /*:window*/) {
    const element = customElements.get("inspect-block")
    if (element) {
      Object.setPrototypeOf(element.prototype, this.prototype)
    } else {
      customElements.define(
        "inspect-block",
        class extends this {
          constructor() {
            super()
            this.init()
          }
        }
      )
    }
  }
  /*::
  root:ShadowRoot
  inspectedValue:mixed
  output:?HTMLElement
  inspector:{fulfilled(mixed):void, pending(mixed):void};
  */
  init() {
    this.root = this.attachShadow({ mode: "open", delegatesFocus: true })
    this.inspectedValue = undefined
  }
  async connectedCallback() {
    const style = this.ownerDocument.createElement("style")
    style.textContent = `
    .observablehq--expanded,
.observablehq--collapsed,
.observablehq--function,
.observablehq--import,
.observablehq--string:before,
.observablehq--string:after,
.observablehq--gray {
  color: var(--syntax_normal);
}
.observablehq--collapsed,
.observablehq--inspect a {
  cursor: pointer;
}
.observablehq--caret {
  margin-right: 4px;
  vertical-align: middle;
}
.observablehq--string-expand {
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 80%;
  background: #eee;
  color: #888;
  cursor: pointer;
  vertical-align: middle;
}
.observablehq--string-expand:hover {
  color: #222;
}
.observablehq--field {
  text-indent: -1em;
  margin-left: 1em;
}
.observablehq--empty {
  color: var(--syntax_comment);
}
a[href],
.observablehq--keyword,
.observablehq--blue {
  color: #3182bd;
}
.observablehq--forbidden,
.observablehq--pink {
  color: #e377c2;
}
.observablehq--orange {
  color: #e6550d;
}
.observablehq--null,
.observablehq--undefined,
.observablehq--boolean {
  color: var(--syntax_atom);
}
.observablehq--bigint,
.observablehq--number,
.observablehq--date,
.observablehq--regexp,
.observablehq--symbol,
.observablehq--green {
  color: var(--syntax_number);
}
.observablehq--index,
.observablehq--key {
  color: var(--syntax_key);
}
.observablehq--empty {
  font-style: oblique;
}
.observablehq--string,
.observablehq--purple {
  color: var(--syntax_string);
}
/* Note: Tachyons' dark-red */
.observablehq--error,
.observablehq--red {
  color: #e7040f;
}
.observablehq {
  position: relative;
  min-height: 33px; /* Note: adjusted dynamically! */
  padding: 0 14px 0 10px;
  border-left: solid 4px transparent;
  transition: border-left-color 250ms linear;
}
.observablehq--inspect {
  font: var(--mono_fonts);
  overflow-x: auto;
  display: block;
  padding: 6px 0;
  white-space: pre;
}
.observablehq--error {
  border-left-color: #e7040f;
}
.observablehq--error .observablehq--inspect {
  word-break: break-all;
  white-space: pre-wrap;
}
.observablehq--running,
.observablehq--changed {
  border-left-color: hsl(217, 13%, 70%);
}

:host {
  outline: none;
  contain: content;
}
    `
    const output = this.ownerDocument.createElement("output")
    this.root.appendChild(style)
    this.output = this.root.appendChild(output)
    this.inspector = new Inspector(output)
    if (this.inspectedValue !== undefined) {
      this.render()
    }
  }
  set source(value /*:mixed*/) {
    const { output } = this
    if (this.inspectedValue !== value) {
      this.inspectedValue = value
      if (output) {
        this.render()
      }
    }
  }
  render() {
    this.inspector.fulfilled(this.inspectedValue)
    // const value = this.inspectedValue
    // output.appendChild(inspect(value, false, false))
  }
}

// const { toString } = Object.prototype

// const inspect = (value, shallow, expand) => {
//   switch (typeof value) {
//     case "boolean": {
//       return plain(String(value), "boolean")
//     }
//     case "undefined": {
//       return plain("undefined", "undefined")
//     }
//     case "number": {
//       return value === 0 && 1 / value < 0
//         ? plain("-0", "number")
//         : plain(String(value), "number")
//     }
//     case "bigint": {
//       return plain(value + "n", "bigint")
//     }
//     case "symbol": {
//       return plain(formatSymbol(value), "symbol")
//     }
//     case "function": {
//       return plain(inspectFunction(value), "function")
//     }
//     case "string": {
//       return plain(formatString(value, shallow, expand), "string")
//     }
//     default: {
//       if (value === null) {
//         return plain("null", "null")
//       }
//       if (value instanceof Date) {
//         return plain(formatDate(value), "date")
//       }
//       if (value === FORBIDDEN) {
//         return plain("[forbidden]", "forbidden")
//       }
//       switch (toString.call(value)) {
//         case "[object RegExp]": {
//           return plain(formatRegExp(value), "regexp")
//         }
//         case "[object Error]":
//         case "[object DOMException]": {
//           return plain(formatError(value), "error")
//         }
//         default: {
//           const inpsect = expand ? inspectExpanded : inspectCollapsed
//           return inspect(value, shallow)
//         }
//       }
//     }
//   }
// }

const plain = (formattedValue, type) => {
  const code = document.createElement("code")
  code.className = `${type}`
  code.textContent = formattedValue
  return code
}
