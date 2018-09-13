// @flow strict

import * as Cell from "../Cell/Data.js"
import * as SelectionMap from "../../Data/SelectionMap.js"

/*::
export type ID = SelectionMap.ID
export type Model = {
  url:string;
  status:"loading"|"ready";
  cells:SelectionMap.SelectionMap<Cell.Model>;
}

*/

const notebook = (url, status, cells = SelectionMap.empty()) => ({
  url,
  status,
  cells
})

export const init = () /*:Model*/ =>
  append(
    [
      {
        input: "// Wellcome to your first notebook"
      }
    ],
    notebook("temp://", "ready")
  )

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

export const cellByID = (id /*:ID*/, state /*:Model*/) /*:?Cell.Model*/ =>
  SelectionMap.valueByKey(id, state.cells)

export const load = (location /*:string*/) /*:Model*/ => ({
  url: `dat://${location}`,
  status: "loading",
  cells: SelectionMap.empty()
})

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
