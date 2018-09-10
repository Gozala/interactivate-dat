// @flow strict

import * as Cell from "../Cell/Data.js"

/*::
export type Model = {
  url:string;
  status:"loading"|"ready";
  nextID:number;
  cells:{[string]: Cell.Model};
}
*/

const notebook = (url, status, nextID = 0, cells = {}) => ({
  url,
  status,
  nextID,
  cells
})

export const init = () /*:Model*/ =>
  insert(notebook("temp://", "ready"), {
    index: 0,
    input: "// Wellcome to your first notebook"
  })

export const insert = (
  state /*:Model*/,
  ...entries /*:{index:number, input:string}[]*/
) /*:Model*/ => {
  let { nextID } = state
  let cells = { ...state.cells }
  for (const { index, input } of entries) {
    const id = `c${++nextID}`
    const cell = Cell.init(index, input)
    cells[id] = cell
  }
  return { ...state, nextID, cells }
}

export const updateCell = (
  state /*:Model*/,
  id /*:string*/,
  cell /*:Cell.Model*/
) => ({
  ...state,
  cells: { ...state.cells, [id]: cell }
})

export const load = (location /*:string*/) /*:Model*/ => ({
  url: `dat://${location}`,
  status: "loading",
  nextID: 0,
  cells: {}
})
