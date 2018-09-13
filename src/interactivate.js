// @flow strict

import { spawn } from "./elm/application.js"
import CodeBlock from "./CodeBlock.js"
import InspectBlock from "./InspectBlock.js"
import * as Main from "./interactivate/Main.js"

if (location.protocol === "dat:") {
  CodeBlock.define(window)
  InspectBlock.define(window)
  window.top.main = spawn(Main, window.top.main, window.top.document)
}
