// @flow status

/*::
export opaque type Model:{input:string, output:mixed} = {
  input: string,
  output: mixed
}
*/

export const init = (input /*:string*/) /*:Model*/ => ({
  input,
  output: undefined
})

export const updateInput = (
  input /*:string*/,
  state /*:Model*/
) /*:Model*/ => ({
  ...state,
  input
})

export const updateOutput = (
  output /*:mixed*/,
  state /*:Model*/
) /*:Model*/ => ({
  ...state,
  output
})
