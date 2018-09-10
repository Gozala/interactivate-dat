// @flow strict

/*::
export type Message =
  | { tag:"Insert", value:{index:number, input:string}[] }
*/

export const insert = (
  entries /*:{index:number, input:string}[]*/
) /*:Message*/ => ({
  tag: "Insert",
  value: entries
})
