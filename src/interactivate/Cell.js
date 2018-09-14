// @flow strict

import { keyedNode, node, on } from "../elm/virtual-dom.js"
import { text, section, div, output } from "../elm/element.js"
import { className, data, attribute, property, id } from "../elm/attribute.js"
import { never, always } from "../elm/basics.js"
import { nofx, fx, send, batch } from "../elm/fx.js"
import { future } from "../elm/Future.js"

import * as Data from "./Cell/Data.js"
import * as Inbox from "./Cell/Inbox.js"
import * as Outbox from "./Cell/Outbox.js"
import * as Decoder from "./Cell/Decoder.js"
import * as FX from "./Cell/FX.js"

/*::
import type { Effect } from "../elm/fx.js"
import type { Node } from "../elm/virtual-dom.js"
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const update = (
  message /*:Message*/,
  state /*:Model*/
) /*:[Model, Effect<Message>]*/ => {
  switch (message.tag) {
    case "change": {
      const { value } = message
      const cell = Data.updateInput(value, state)
      const [token, ...tokens] = tokenize(value)
      const fx = token === value ? null : send(Inbox.change(token))
      if (tokens.length === 0) {
        return [cell, fx ? fx : nofx]
      } else {
        const inserts = []
        for (const input of tokens) {
          inserts.push({ input })
        }
        const insert = send(Outbox.insert(inserts))
        return [cell, fx ? batch(fx, insert) : nofx]
      }
    }
    case "leave": {
      return [state, nofx]
    }
    case "split": {
      return [state, fx(FX.evaluate("out", state.input), Inbox.output)]
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
) /*:[Model, Effect<Message>]*/ => {
  return [state, fx(FX.setSelection(`cell-${id}`, direction))]
}

const tokenize = input => {
  const tokens = []
  let match = null
  let offset = 0
  while ((match = CELL_PATTERN.exec(input))) {
    const start = offset
    const end = match.index + match[0].length
    const token = input.slice(start, end)
    tokens.push(token)
    offset = end
  }

  if (offset === 0) {
    tokens.push(input)
  } else if (offset < input.length) {
    tokens.push(input.slice(offset))
  }

  return tokens
}

const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*$)/gm

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
  node("inspect-block", [className("flex"), property("source", result)])

const viewCodeBlock = (input, key) =>
  node("code-block", [
    id(key),
    property("source", input),
    on("focus", Decoder.focus),
    on("change", Decoder.change),
    on("escape", Decoder.escape),
    on("split", Decoder.split),
    on("delete", Decoder.remove)
  ])
