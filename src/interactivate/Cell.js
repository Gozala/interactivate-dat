// @flow strict

import { keyedNode, node, on } from "../elm/virtual-dom.js"
import { text, section, div, output } from "../elm/element.js"
import { className, data, attribute, property } from "../elm/attribute.js"
import { never, always } from "../elm/basics.js"
import { nofx, fx, send, batch } from "../elm/fx.js"
import { future } from "../elm/Future.js"

import * as Data from "./Cell/Data.js"
import * as Inbox from "./Cell/Inbox.js"
import * as Outbox from "./Cell/Outbox.js"
import * as Decoder from "./Cell/Decoder.js"

/*::
import type { Node } from "../elm/virtual-dom.js"
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "change": {
      const { value } = message
      const cell = Data.updateInput(state, value)
      const [token, ...tokens] = tokenize(value)
      const fx = token === value ? nofx : send(Inbox.change(token))
      if (tokens.length === 0) {
        return [cell, fx, nofx]
      } else {
        const inserts = []
        let index = cell.index
        for (const input of tokens) {
          index += 1
          inserts.push({ index, input })
        }
        return [cell, fx, send(Outbox.insert(inserts))]
      }
    }
    case "leave": {
      console.log("THIS IS COOL !!", message)
      return [state, nofx, nofx]
    }
    case "split": {
      console.log(message)
      return [state, nofx, nofx]
    }
    default: {
      return never(message)
    }
  }
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
  status /*:string*/ = ""
) /*:Node<Inbox.Message>*/ =>
  section(
    [data("index", `${state.index}`), className(`cell ${status}`)],
    [viewCodeBlock(state.input), output([className("flex bb bb b--black-05")])]
  )

const viewCodeBlock = input =>
  node("code-block", [
    property("source", input),
    on("change", Decoder.change),
    on("escape", Decoder.escape),
    on("split", Decoder.split)
  ])
