// @flow strict

/*::

import * as Notebook from "../Notebook.js"

export type Payload =
  | { tag: "navigate", value:URL }
  | { tag: "load", value:URL }
  | { tag: "navigated", value:URL }

export type Message =
  | { tag: "Receive", value: Payload }
  | { tag: "Notebook", value: Notebook.Message }
*/

export const notebook = (value /*:Notebook.Message*/) /*:Message*/ => ({
  tag: "Notebook",
  value
})

export const receive = (value /*:Payload*/) /*:Message*/ => ({
  tag: "Receive",
  value
})

export const onInternalURLRequest = (value /*:URL*/) =>
  receive({ tag: "navigate", value })

export const onExternalURLRequest = (value /*:URL*/) =>
  receive({ tag: "load", value })

export const onURLChange = (value /*:URL*/) =>
  receive({ tag: "navigated", value })
