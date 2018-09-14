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
  h2,
  select
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
    // case "insert": {
    //   debugger
    //   return [Data.insert(message.value, state), nofx]
    // }
    // case "leave": {
    //   const next = Data.changeCellSelection(message.value, true, state)
    //   const id = Data.selectedCellID(next)
    //   return [next, id == null ? nofx : fx(focus(`cell-${id}`))]
    // }
    // case "focus": {
    //   return [state, nofx]
    // }
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
    Data.cells(state).map(viewCell)
  )

const viewCell = ([key, cell, focused]) => [
  key,
  Cell.view(cell, `cell-${key}`, focused).map(Inbox.cell(key))
]
