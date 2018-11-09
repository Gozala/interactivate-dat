// @flow strict

import { keyedNode, node, on } from "../reflex/VirtualDOM.js"
import { text, section, div, output, customElement } from "../reflex/Element.js"
import {
  className,
  data,
  attribute,
  property,
  id
} from "../reflex/Attribute.js"
import { never, always } from "../reflex/Basics.js"
import { nofx, fx, send, batch } from "../reflex/Effect.js"
import { future } from "../reflex/Future.js"
import InspectBlock from "../Element/InspectBlock.js"
import CodeBlock from "../Element/CodeBlock.js"

import * as Data from "./Cell/Data.js"
import * as Inbox from "./Cell/Inbox.js"
import * as Outbox from "./Cell/Outbox.js"
import * as Decoder from "./Cell/Decoder.js"
import * as Effect from "./Cell/Effect.js"

/*::
import type { Node } from "../reflex/VirtualDOM.js"
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "change": {
      const { value } = message
      const cell = Data.updateInput(value, state)
      const tokens = Data.tokenize(value)
      switch (tokens.length) {
        case 0: {
          return [cell, send(Inbox.join(1))]
        }
        case 1: {
          return [cell, nofx]
        }
        default: {
          const [token, ...rest] = tokens
          const inserts = []
          for (const input of rest) {
            inserts.push({ input })
          }
          const replace = send(Inbox.change(token))
          const insert = send(Outbox.insert(inserts))
          return [cell, batch(replace, insert)]
        }
      }
    }
    case "join": {
      return [state, nofx]
    }
    case "leave": {
      return [state, nofx]
    }
    case "split": {
      return [
        state,
        fx(Effect.evaluate(state.id, state.input), Inbox.output, Inbox.output)
      ]
    }
    case "focus": {
      return [state, nofx]
    }
    case "output": {
      return [Data.updateOutput(message.value, state), nofx]
    }
    case "insert": {
      return [state, nofx]
    }
    case "remove": {
      return [state, nofx]
    }
    default: {
      return never(message)
    }
  }
}

export const setSelection = (
  direction /*:-1|1*/,
  id /*:string*/,
  state /*:Model*/
) => {
  return [state, fx(Effect.setSelection(`cell-${id}`, direction))]
}

export const view = (
  state /*:Model*/,
  key /*:string*/,
  focused /*:boolean*/
) /*:Node<Message>*/ =>
  section(
    [className(`cell bl ${focused ? "b--silver" : "b--transparent"}`)],
    [viewCodeBlock(state.input, key), viewOutput(state.output, key)]
  )

const viewOutput = (result, key) =>
  customElement("inspect-block", InspectBlock, [
    className("flex"),
    property("source", result)
  ])

const viewCodeBlock = (input, key) =>
  customElement("code-block", CodeBlock, [
    id(key),
    property("source", input),
    on("focus", Decoder.focus),
    on("change", Decoder.change),
    on("escape", Decoder.escape),
    on("split", Decoder.split),
    on("delete", Decoder.remove)
  ])
