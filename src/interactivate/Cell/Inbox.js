// @flow strict

/*::
export type Message =
  | { tag:"change", value:string }
  | { tag:"leave", value:-1|1 }
  | { tag:"split" }
*/

export const change = (value /*:string*/) /*:Message*/ => ({
  tag: "change",
  value
})
