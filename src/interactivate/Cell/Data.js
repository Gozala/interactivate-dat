// @flow status

/*::
export opaque type Model:{input:string, output:mixed} = {
  input: string,
  output: mixed
}
*/

export const init = (
  input /*:string*/,
  output /*:mixed*/ = undefined
) /*:Model*/ => ({
  input,
  output
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

export const input = ({ input } /*:Model*/) /*:string*/ => input
