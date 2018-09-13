// @flow strict

/*::
export type Message =
  | { tag:"leave", value:-1|1 }
  | { tag:"focus" }
  | { tag:"insert", value:{input:string}[] }
*/

export const insert = (entries /*:{input:string}[]*/) /*:Message*/ => ({
  tag: "insert",
  value: entries
})
