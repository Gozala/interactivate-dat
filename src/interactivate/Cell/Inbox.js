// @flow strict

/*::
export type Direction =
  | -1
  | 1

export type Message =
  | { tag:"change", value:string }
  | { tag:"leave", value:Direction }
  | { tag:"remove", value:Direction }
  | { tag:"split" }
  | { tag:"focus" }
  | { tag:"output", value:mixed }
  | { tag:"insert", value:{input:string}[] }
  | { tag:"join", value:Direction}
*/

export const change = (value /*:string*/) /*:Message*/ => ({
  tag: "change",
  value
})

export const output = (value /*:mixed*/) /*:Message*/ => ({
  tag: "output",
  value
})

export const join = (dir /*:Direction*/) /*:Message*/ => ({
  tag: "join",
  value: dir
})
