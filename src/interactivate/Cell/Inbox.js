// @flow strict

/*::
export type Message =
  | { tag:"change", value:string }
  | { tag:"leave", value:-1|1 }
  | { tag:"split" }
  | { tag:"focus" }
  | { tag:"output", value:mixed }
  | { tag:"insert", value:{input:string}[] }
*/

export const change = (value /*:string*/) /*:Message*/ => ({
  tag: "change",
  value
})

export const output = (value /*:mixed*/) /*:Message*/ => ({
  tag: "output",
  value
})
