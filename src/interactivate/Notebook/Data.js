// @flow strict

import * as Cell from "../Cell/Data.js"
import * as SelectionMap from "../../Data/SelectionMap.js"

/*::
export type ID = SelectionMap.ID
export type Model = {
  url:string;
  status:"loading"|"ready"|"error";
  cells:SelectionMap.SelectionMap<Cell.Model>;
}

*/

const notebook = (url, status, cells = SelectionMap.empty()) => ({
  url,
  status,
  cells
})

export const init = (url /*:string*/, input /*:string*/) /*:Model*/ => {
  const cell = Cell.init(input)
  const cells = SelectionMap.select(cell, SelectionMap.fromValues([cell]))
  return notebook(url, "ready", cells)
}

export const load = (location /*:string*/) /*:Model*/ =>
  notebook(`dat://${location}`, "loading")

export const failLoad = (state /*:Model*/) =>
  state.status === "loading" ? { ...state, status: "error" } : state

export const append = (
  entries /*:{input:string}[]*/,
  state /*:Model*/
) /*:Model*/ => {
  const cells = SelectionMap.append(
    entries.map(({ input }) => Cell.init(input)),
    state.cells
  )

  return { ...state, cells }
}

export const insert = (
  id /*:ID*/,
  dir /*:1|-1*/,
  entries /*:{input:string}[]*/,
  state /*:Model*/
) /*:Model*/ => {
  const cells = SelectionMap.insert(
    id,
    dir,
    entries.map(({ input }) => Cell.init(input)),
    state.cells
  )

  return { ...state, cells }
}

export const removeCells = (ids /*:ID[]*/, state /*:Model*/) /*:Model*/ => {
  const cells = SelectionMap.remove(ids, state.cells)
  return { ...state, cells }
}

export const replaceCell = (
  id /*:ID*/,
  cell /*:Cell.Model*/,
  state /*:Model*/
) => ({
  ...state,
  cells: SelectionMap.replaceWith(
    id,
    maybeCell => (maybeCell ? cell : null),
    state.cells
  )
})

export const joinCell = (id /*:ID*/, dir /*:-1|1*/, state /*:Model*/) => {
  const cells = SelectionMap.join(
    (left, right) => Cell.init(`${left.input}\n${right.input}`, right.output),
    id,
    dir,
    state.cells
  )
  return { ...state, cells }
}

export const cellByID = (id /*:ID*/, state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByKey(id, state.cells)

export const cells = (
  state /*:Model*/
) /*:Array<[ID, Cell.Model, boolean]>*/ => [
  ...SelectionMap.entries(state.cells)
]

export const changeCellSelection = (
  offset /*:number*/,
  loop /*:boolean*/,
  state /*:Model*/
) => ({
  ...state,
  cells: SelectionMap.selectByOffset(offset, loop, state.cells)
})

export const selectByID = (id /*:ID*/, state /*:Model*/) => ({
  ...state,
  cells: SelectionMap.selectByKey(id, state.cells)
})

export const selectedCellID = (state /*:Model*/) /*:?ID*/ =>
  SelectionMap.selectedKey(state.cells)

export const selectedCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.selectedValue(state.cells)

export const selection = (state /*:Model*/) /*:?[ID, Cell.Model]*/ =>
  SelectionMap.selectedEntry(state.cells)

export const lastCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByIndex(-1, state.cells)

export const firstCell = (state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByIndex(0, state.cells)
