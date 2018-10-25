// @flow strict

import { nofx, fx, batch } from "../elm/fx.js"
import {
  text,
  i,
  h3,
  pre,
  main,
  node,
  doc,
  body,
  button
} from "../elm/element.js"
import { on, className } from "../elm/attribute.js"
import { never } from "../elm/basics.js"

import * as Data from "./Main/Data.js"
import * as Inbox from "./Main/Inbox.js"
import * as Effect from "./Main/Effect.js"
import * as Decoder from "./Main/Decoder.js"
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
    const notebookURL = path === "" ? null : new URL(`//${path}`, url)
    const [notebook, fx] = Notebook.open(notebookURL)
    return [Data.init(notebook), fx.map(Inbox.notebook)]
  }
}

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "Notebook": {
      const [notebook, fx] = Notebook.update(
        message.value,
        Data.notebook(state)
      )
      return [Data.updateNotebook(state, notebook), fx.map(Inbox.notebook)]
    }
    case "publish": {
      const resource = Data.toResource(state)
      const effect =
        resource == null
          ? nofx
          : fx(
              Effect.save(resource.url, resource.content),
              Inbox.onPublishOk,
              Inbox.onPublishError
            )
      return [Data.save(state), effect]
    }
    case "published": {
      return [Data.saved(state), nofx]
    }
    case "publishFailed": {
      return [Data.saveFailed(message.value, state), nofx]
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
      return init(null, message.value)
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
      [
        Notebook.view(Data.notebook(state)).map(Inbox.notebook),
        viewSaveButton(Data.status(state))
      ]
    )
  )

const viewSaveButton = status =>
  button(
    [
      className(`fixed bottom-2 right-2 publish ${status}`),
      on("click", Decoder.publish)
    ],
    [text("Save")]
  )

export const { onInternalURLRequest, onExternalURLRequest, onURLChange } = Inbox
