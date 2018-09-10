// @flow strict

import { nofx, fx, batch } from "../elm/fx.js"
import {
  text,
  main,
  img,
  a,
  picture,
  source,
  section,
  article,
  header,
  div,
  h1,
  h2
} from "../elm/element.js"
import {
  className,
  src,
  srcset,
  alt,
  data,
  attribute,
  property
} from "../elm/attribute.js"
import { never } from "../elm/basics.js"

import * as Data from "./Notebook/Data.js"
import * as Inbox from "./Notebook/Inbox.js"
import { keyedNode, node } from "../elm/virtual-dom.js"
import * as Cell from "./Cell.js"

/*::
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = () => [Data.init(), nofx]
export const load = (path /*:string*/) => [Data.load(path), nofx]
export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "LoadNotebook": {
      return [state, nofx]
    }
    case "Cell": {
      const [id, payload] = message.value
      return updateCell(state, id, payload)
    }
    case "Insert": {
      return [Data.insert(state, ...message.value), nofx]
    }
    default: {
      return never(message)
    }
  }
}

const updateCell = (state, id, message) => {
  const cell = state.cells[id]
  if (cell) {
    const [cell2, fxIn, fxOut] = Cell.update(message, cell)
    return [
      Data.updateCell(state, id, cell2),
      batch(fxIn.map(Inbox.cell(id)), fxOut.map(Inbox.receive))
    ]
  } else {
    return [state, nofx]
  }
}

export const view = (state /*:Model*/) =>
  article(
    [className("w-100 mw8 ph3 center mt4")],
    [viewHeader(state), viewDocument(state)]
  )

const viewHeader = state =>
  header(
    [
      className(
        "flex justify-between measure-wide-ns items-center-ns items-top pl2-ns mw-100"
      )
    ],
    [
      picture(
        [className("inline-flex")],
        [
          source([srcset("dat://gozala.hashbase.io/profile.jpeg")]),
          source([srcset("./icons/fontawesome/svgs/solid/user.svg")]),
          img([className("br-100 h3 w3 mw3 dib")])
        ]
      ),
      div(
        [className("w-100 pl2 pl3-ns f6")],
        [
          a(
            [className("flex items-center no-underline black hover-blue")],
            [text("Irakli Gozalishvili")]
          ),
          div(
            [className("mt1 lh-copy black-50")],
            [
              text(
                "Curios tinkerer at Mozilla that fancies functional paradigm. Environmentalist; Husband; Father; LISPer with recently developed interest in static type systems."
              )
            ]
          )
        ]
      ),
      div([className("dtc v-mid")])
    ]
  )

const viewDocument = state =>
  keyedNode(
    "main",
    [className("relative mh0-ns nr3 nl3 mt4")],
    entries(state.cells).map(viewCell)
  )

const viewCell = ([key, cell]) => [
  key,
  Cell.view(cell, key).map(Inbox.cell(key))
]

export const entries = /*::<a>*/ (
  dict /*:a*/
) /*:Array<[$Keys<a>, $Values<a>]>*/ => {
  const entries /*:any*/ = Object.entries(dict)
  return entries
}
