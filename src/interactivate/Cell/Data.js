// @flow status

/*::
export type Model = {
  index: number,
  input: string
}
*/

export const init = (index /*:number*/, input /*:string*/) /*:Model*/ => ({
  index,
  input
})

export const updateInput = (state /*:Model*/, input /*:string*/) => ({
  ...state,
  input
})
