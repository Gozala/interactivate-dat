// @flow strict

/*::
import type { ID } from "./Data.js"
import * as Inbox from "../Cell/Inbox.js"
import * as Outbox from "../Cell/Outbox.js"

export type Message =
  | { tag: "LoadNotebook", value: string }
  | { tag: "LoadFailed", value:Error }
  | { tag: "Cell", value:[ID, Inbox.Message] }
*/

const route = (message /*:Message*/) => {}

export const cell = (key /*:ID*/) => (
  value /*:Inbox.Message*/
) /*:Message*/ => ({ tag: "Cell", value: [key, value] })

export const loadOk = (value /*:string*/) => ({
  tag: "LoadNotebook",
  value
})

export const loadError = (value /*:Error*/) => ({
  tag: "LoadFailed",
  value
})
