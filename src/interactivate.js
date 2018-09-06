// @flow strict

import { spawn } from "./elm/application.js"
import CodeArea from "./codearea.js"
import * as Main from "./interactivate/Main.js"

if (location.protocol === "dat:") {
  CodeArea.define(window.top)
  window.top.main = spawn(Main, window.top.main, window.top.document)
}
