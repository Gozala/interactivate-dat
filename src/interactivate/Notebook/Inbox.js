// @flow strict

import { never } from "../../elm/basics.js"

/*::
import * as Inbox from "../Cell/Inbox"
import * as Outbox from "../Cell/Outbox"

export type Message =
  | { tag: "LoadNotebook", value: string }
  | { tag: "Cell", value:[string, Inbox.Message] }
  | { tag: "Insert", value:{index:number, input:string}[]}
*/

export const cell = (key /*:string*/) => (
  value /*:Inbox.Message*/
) /*:Message*/ => ({ tag: "Cell", value: [key, value] })

export const receive = (message /*:Outbox.Message*/) /*:Message*/ => {
  switch (message.tag) {
    case "Insert": {
      return message
    }
    default: {
      return never(message)
    }
  }
}
