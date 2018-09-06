// @flow strict

import { nofx, fx, batch } from "../elm/fx.js"
import { text, h3, pre, main, doc, body } from "../elm/element.js"
import { never } from "../elm/basics.js"

import * as Data from "./Notebook/Data.js"
import * as Inbox from "./Notebook/Inbox.js"

/*::
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = () => [Data.init(), nofx]
export const load = (path /*:string*/) => [Data.load(path), nofx]
export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "LoadNotebook": {
      return [state, nofx]
    }
    default: {
      return never(message)
    }
  }
}
