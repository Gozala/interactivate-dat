// @flow strict

import { always } from "../../elm/basics.js"
/*::
import * as Notebook from "../Notebook.js"

export type Payload =
  | { tag: "navigate", value:URL }
  | { tag: "load", value:URL }
  | { tag: "navigated", value:URL }

export type Message =
  | { tag: "Receive", value: Payload }
  | { tag: "Notebook", value: Notebook.Message }
  | { tag: "publish", value:true }
  | { tag: "published", value:URL }
  | { tag: "publishFailed", value:Error }
*/

export const notebook = (value /*:Notebook.Message*/) /*:Message*/ => ({
  tag: "Notebook",
  value
})

export const receive = (value /*:Payload*/) /*:Message*/ => ({
  tag: "Receive",
  value
})

export const onPublishOk = always({ tag: "published", value: true })

export const onPublishError = (value /*: Error*/) => ({
  tag: "publishFailed",
  value
})

export const onInternalURLRequest = (value /*:URL*/) =>
  receive({ tag: "navigate", value })

export const onExternalURLRequest = (value /*:URL*/) =>
  receive({ tag: "load", value })

export const onURLChange = (value /*:URL*/) =>
  receive({ tag: "navigated", value })
