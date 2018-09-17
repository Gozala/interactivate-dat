// @flow strict

import { nofx, fx, batch } from "../elm/fx.js"
import { text, h3, pre, main, node, doc, body } from "../elm/element.js"
import { className } from "../elm/attribute.js"
import { never } from "../elm/basics.js"

import * as Data from "./Main/Data.js"
import * as Inbox from "./Main/Inbox.js"
import * as Effect from "./Main/Effect.js"
import * as Notebook from "./Notebook.js"

/*::
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = (options /*:?{state:Model}*/, url /*:URL*/) => {
  if (options) {
    return [options.state, nofx]
  } else {
    const path = url.pathname.substr(1)
    const [notebook, fx] = path === "" ? Notebook.init() : Notebook.load(path)
    return [Data.init(notebook), fx.map(Inbox.notebook)]
  }
}

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "Notebook": {
      const [notebook, fx] = Notebook.update(message.value, state.notebook)
      return [Data.updateNotebook(state, notebook), fx.map(Inbox.notebook)]
    }
    case "Receive": {
      return receive(message.value, state)
    }
    default: {
      return never(message)
    }
  }
}

const receive = (message, state) => {
  switch (message.tag) {
    case "navigate": {
      return [state, fx(Effect.navigate(message.value))]
    }
    case "navigated": {
      const path = message.value.pathname
      const [notebook, fx] = path === "" ? Notebook.init() : Notebook.load(path)
      return [Data.init(notebook), fx.map(Inbox.notebook)]
    }
    case "load": {
      return [state, fx(Effect.load(message.value))]
    }
    default: {
      return never(message)
    }
  }
}

export const view = (state /*:Model*/) =>
  doc(
    "",
    body(
      [className("sans-serif")],
      [Notebook.view(state.notebook).map(Inbox.notebook)]
    )
  )

export const { onInternalURLRequest, onExternalURLRequest, onURLChange } = Inbox
