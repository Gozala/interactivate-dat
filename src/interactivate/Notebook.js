// @flow strict

import { nofx, fx, batch } from "../reflex/Effect.js"
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
  h2,
  select,
  progress,
  form
} from "../reflex/Element.js"
import {
  className,
  src,
  srcset,
  alt,
  data,
  attribute,
  property
} from "../reflex/Attribute.js"
import { never } from "../reflex/Basics.js"

import * as Data from "./Notebook/Data.js"
import * as Inbox from "./Notebook/Inbox.js"
import { keyedNode, node } from "../reflex/VirtualDOM.js"
import * as Cell from "./Cell.js"
import * as Dat from "../io/dat.js"

/*::
export type Model = Data.Model
export type Message = Inbox.Message
*/

export const init = () => {
  const state = Data.init(null, `show: "Hello"`)
  const selection = Data.selection(state)
  if (selection) {
    const [id, cell] = selection
    const [cell2, fx] = Cell.setSelection(-1, id, cell)
    const state2 = Data.replaceCell(id, cell2, state)
    return [state2, fx.map(Inbox.cell(id))]
  } else {
    return [state, nofx]
  }
}

export const load = (url /*:URL*/) => [
  Data.load(url),
  fx(Dat.readFile(url), Inbox.loadOk, Inbox.loadError)
]

export const open = (url /*:?URL*/) => (url ? load(url) : init())

export const update = (message /*:Message*/, state /*:Model*/) => {
  switch (message.tag) {
    case "LoadNotebook": {
      return [Data.init(state.url, message.value), nofx]
    }
    case "LoadFailed": {
      return [Data.failLoad(state), nofx]
    }
    case "Cell": {
      const [id, payload] = message.value
      return updateCell(state, id, payload)
    }
    default: {
      return never(message)
    }
  }
}

const updateCell = (state, id, message) => {
  switch (message.tag) {
    case "output":
    case "change": {
      const cell = Data.cellByID(id, state)
      if (cell) {
        const [cell2, fx] = Cell.update(message, cell)
        return [Data.replaceCell(id, cell2, state), fx.map(Inbox.cell(id))]
      } else {
        return [state, nofx]
      }
    }
    case "insert": {
      return [Data.insert(id, 1, message.value, state), nofx]
    }
    case "focus": {
      return [Data.selectByID(id, state), nofx]
    }
    case "leave": {
      return setSelection(message.value, state)
    }
    case "split": {
      const targetCell = Data.cellByID(id, state)
      if (targetCell) {
        const [cell, fx] = Cell.update(message, targetCell)
        let data = Data.replaceCell(id, cell, state)

        data =
          targetCell === Data.lastCell(state)
            ? Data.append([{ input: "" }], data)
            : data

        if (targetCell === Data.selectedCell(state)) {
          const [next, fx2] = setSelection(1, data)
          return [next, batch(fx.map(Inbox.cell(id)), fx2)]
        } else {
          return [data, fx.map(Inbox.cell(id))]
        }
      } else {
        return [state, nofx]
      }
    }
    case "remove": {
      const [data, fx] = setSelection(message.value, state)
      return [Data.removeCells([id], data), fx]
    }
    case "join": {
      return [Data.joinCell(id, message.value, state), nofx]
    }
    default: {
      return never(message)
    }
  }
}

const setSelection = (dir, state) => {
  let data = Data.changeCellSelection(dir, true, state)
  const selection = Data.selection(data)
  if (selection) {
    const [id, cell] = selection
    const [cell2, fx] = Cell.setSelection(dir, id, cell)
    return [Data.replaceCell(id, cell2, data), fx.map(Inbox.cell(id))]
  } else {
    return [data, nofx]
  }
}

export const view = (state /*:Model*/) =>
  form(
    [className(`w-100 h-100 load ${state.status}`)],
    [
      article(
        [className(`w-100 h-100 ph3 overflow-container center bg-white`)],
        [viewHeader(state), viewDocument(state)]
      ),
      div([className(`progress`)])
    ]
  )

const viewHeader = state =>
  header(
    [
      className(
        "flex justify-between measure-wide-ns items-center-ns items-top pl2-ns mw-100"
      )
    ],
    [
      // picture(
      //   [className("inline-flex")],
      //   [
      //     source([srcset("dat://gozala.hashbase.io/profile.jpeg")]),
      //     source([srcset("./icons/fontawesome/svgs/solid/user.svg")]),
      //     img([className("br-100 h3 w3 mw3 dib")])
      //   ]
      // ),
      // div(
      //   [className("w-100 pl2 pl3-ns f6")],
      //   [
      //     a(
      //       [className("flex items-center no-underline black hover-blue")],
      //       [text("Irakli Gozalishvili")]
      //     ),
      //     div(
      //       [className("mt1 lh-copy black-50")],
      //       [
      //         text(
      //           "Curios tinkerer at Mozilla that fancies functional paradigm. Environmentalist; Husband; Father; LISPer with recently developed interest in static type systems."
      //         )
      //       ]
      //     )
      //   ]
      // ),
      // div([className("dtc v-mid")])
    ]
  )

const viewDocument = state =>
  keyedNode(
    "main",
    [className("relative mh0-ns nr3 nl3 mt4")],
    Data.cells(state).map(viewCell)
  )

const viewCell = ([key, cell, focused]) => [
  key,
  Cell.view(cell, `cell-${key}`, focused).map(Inbox.cell(key))
]
