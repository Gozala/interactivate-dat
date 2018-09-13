// @flow strict

import { never } from "../../elm/basics.js"

/*::
import type { ID } from "./Data.js"
import * as Inbox from "../Cell/Inbox.js"
import * as Outbox from "../Cell/Outbox.js"

export type Message =
  | { tag: "LoadNotebook", value: string }
  | { tag: "Cell", value:[ID, Inbox.Message] }
*/

const route = (message /*:Message*/) => {}

export const cell = (key /*:ID*/) => (
  value /*:Inbox.Message*/
) /*:Message*/ => ({ tag: "Cell", value: [key, value] })
