// @flow strict

/*::
import type { ID } from "./Data.js"
import * as Inbox from "../Cell/Inbox.js"
import * as Outbox from "../Cell/Outbox.js"

export type Message =
  | { tag: "onLoaded", value: {content:string, url:URL, isOwner:boolean } }
  | { tag: "onLoadError", value:Error }
  | { tag: "onCell", value:[ID, Inbox.Message] }
*/

const route = (message /*:Message*/) => {}

export const onCell = (key /*:ID*/) => (
  value /*:Inbox.Message*/
) /*:Message*/ => ({ tag: "onCell", value: [key, value] })

export const onLoaded = (
  value /*:{content:string, url:URL, isOwner:boolean }*/
) => ({
  tag: "onLoaded",
  value
})

export const onLoadError = (value /*:Error*/) => ({
  tag: "onLoadError",
  value
})
