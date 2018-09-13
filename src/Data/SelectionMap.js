// @flow strict

import * as Dict from "./Dictionary.js"

/*::
export opaque type ID: string = string

export opaque type SelectionMap<a> = {
  +nextID: number,
  +index: ID[],
  +values: Dict.Dictionary<a>,
  +selectionIndex: number
}

type Mutable<a> = {
  nextID: number,
  index: ID[],
  values: Dict.Dictionary<a>,
  selectionIndex: number
}
*/

const mutable = /*::<a>*/ () /*:Mutable<a>*/ => ({
  nextID: 0,
  index: [],
  values: Dict.empty(),
  selectionIndex: -1
})

export const empty = /*::<a>*/ () /*:SelectionMap<a>*/ => mutable()

const pairs = /*::<a, b>*/ () /*:Array<[a, b]>*/ => []

export const fromValues = /*::<a>*/ (
  values /*:Iterable<a>*/
) /*:SelectionMap<a>*/ => {
  let nextID = 0
  const entries = pairs()
  const index = []
  for (const value of values) {
    const id = `${nextID++}`
    index.push(id)
    entries.push([id, value])
  }

  return { nextID, index, values: Dict.from(entries), selectionIndex: -1 }
}

export const append = /*::<a>*/ (
  items /*:a[]*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let { nextID, selectionIndex } = data
  let index = [...data.index]
  let entries = pairs()
  for (const item of items) {
    let id = `${nextID++}`
    index.push(id)
    entries.push([id, item])
  }

  const values = Dict.insertBatch(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

export const insert = /*::<a>*/ (
  key /*:ID*/,
  dir /*:-1|1*/,
  items /*:a[]*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let { nextID, selectionIndex } = data
  const index = [...data.index]
  let offset = Math.min(Math.max(0, index.indexOf(key) + 1), index.length)
  const entries = pairs()
  for (const item of items) {
    const id = `${nextID++}`
    index.splice(offset++, 0, id)
    entries.push([id, item])
  }
  const values = Dict.insertBatch(entries, data.values)
  return { selectionIndex, nextID, index, values }
}

export const selectedKey = /*::<a>*/ (data /*:SelectionMap<a>*/) /*:?ID*/ =>
  data.index[data.selectionIndex]

export const selectedValue = /*::<a>*/ (data /*:SelectionMap<a>*/) /*:?a*/ => {
  const id = selectedKey(data)
  return id != null ? Dict.get(id, data.values) : null
}

export const valueByIndex = /*::<a>*/ (
  n /*:number*/,
  data /*:SelectionMap<a>*/
) /*:?a*/ => {
  const { index, values } = data
  const offset = n < 0 ? index.length + n : n
  const id = index[offset]
  if (id != null) {
    return Dict.get(id, data.values)
  } else {
    return null
  }
}

export const valueByKey = /*::<a>*/ (
  key /*:ID*/,
  data /*:SelectionMap<a>*/
) /*:?a*/ => Dict.get(key, data.values)

export const selectedEntry = /*::<a>*/ (
  data /*:SelectionMap<a>*/
) /*:?[ID, a]*/ => {
  const id = selectedKey(data)
  if (id == null) {
    return null
  } else {
    const value = selectedValue(data)
    return value != null ? [id, value] : null
  }
}

export const deselect = /*::<a>*/ (
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => ({ ...data, selectionIndex: -1 })

export const select = /*::<a>*/ (
  value /*:a*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => selectBy($ => $ === value, data)

export const selectBy = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const { nextID, index, values } = data
  const id = Dict.findKey(predicate, values)
  const selectionIndex = id == null ? -1 : index.indexOf(id)

  if (selectionIndex !== data.selectionIndex) {
    return { ...data, selectionIndex }
  } else {
    return data
  }
}

export const selectByKey = /*::<a>*/ (
  key /*:ID*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const selectionIndex = data.index.indexOf(key)
  return { ...data, selectionIndex }
}

export const selectByOffset = /*::<a>*/ (
  offset /*:number*/,
  loop /*:boolean*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  let selectionIndex = data.selectionIndex + offset
  const count = data.index.length
  if (loop) {
    while (selectionIndex < 0) {
      selectionIndex += count
    }
    while (selectionIndex >= count) {
      selectionIndex -= count
    }
  } else {
    selectionIndex = Math.min(
      Math.max(0, selectionIndex),
      data.index.length - 1
    )
  }
  return { ...data, selectionIndex }
}

export const map = /*::<a, b>*/ (
  f /*:(a) => b*/,
  data /*:SelectionMap<a>*/
) /*: SelectionMap<b>*/ => {
  const { nextID, index, selectionIndex, values } = data
  return { nextID, index, selectionIndex, values: Dict.map(f, data.values) }
}

export const filter = /*::<a>*/ (
  predicate /*:a => boolean*/,
  data /*:SelectionMap<a>*/
) /*: SelectionMap<a>*/ => {
  const { nextID, index, selectionIndex, values } = data
  const nextIndex = []
  const entries = pairs()
  let nextSelectionIndex = selectionIndex
  for (const id of index) {
    const value = Dict.get(id, values)
    if (value != null && predicate(value)) {
      nextIndex.push(id)
      entries.push([id, value])
    } else if (id === nextSelectionIndex) {
      nextSelectionIndex = -1
    }
  }

  return {
    nextID,
    index: nextIndex,
    selectionIndex: nextSelectionIndex,
    values: Dict.from(entries)
  }
}

export const entries = function* entries /*::<a>*/(
  data /*:SelectionMap<a>*/
) /*: Iterable<[ID, a, boolean]>*/ {
  const { index, selectionIndex, values } = data
  let offset = 0
  for (const id of index) {
    const value = Dict.get(id, values)
    if (value != null) {
      yield [id, value, selectionIndex === offset]
    }
    offset += 1
  }
}

export const keys = /*::<a>*/ (data /*:SelectionMap<a>*/) /*: Iterable<ID>*/ =>
  data.index

export const values = function* entries /*::<a>*/(
  data /*:SelectionMap<a>*/
) /*: Iterable<a>*/ {
  for (const [, value] of entries(data)) {
    yield value
  }
}

export const replaceWith = /*::<a>*/ (
  key /*:ID*/,
  replace /*:?a => ?a*/,
  data /*:SelectionMap<a>*/
) /*:SelectionMap<a>*/ => {
  const values = Dict.replaceWith(key, replace, data.values)

  return values === data.values ? data : { ...data, values }
}

// export interface SelectionMap<a> {
//   // Mark an item as selected. This will select at most one item.
//   // Any previously selected item will be unselected.
//   select(a): SelectionMap<a>;
//   deselect(): SelectionMap<a>;
//   selectBy((a) => boolean): SelectionMap<a>;
//   selectedValue(): ?a;
//   selectedEntry(): ?[ID, a];
//   updateSelected<param>((param, a) => a): SelectionMap<a>;
//   map<b>((a) => b): SelectionMap<b>;
//   filter((a) => boolean): SelectionMap<a>;
//   keys(): Iterable<ID>;
//   values(): Iterable<a>;
//   entries(): Iterable<[ID, a, boolean]>;
// }

// export const fromArray = (values /*:a[]*/) /*:SelectionMap<a>*/ => {}
