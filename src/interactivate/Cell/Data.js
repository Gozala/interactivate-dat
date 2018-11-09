// @flow status

/*::
export opaque type Model:{+id:string, +input:string, +output:mixed} = {
  id: string,
  input: string,
  output: mixed
}
*/

export const init = (
  id /*:string*/,
  input /*:string*/,
  output /*:mixed*/ = undefined
) /*:Model*/ => ({
  id,
  input,
  output
})

export const updateID = (id /*:string*/, state /*:Model*/) /*:Model*/ => ({
  ...state,
  id
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

export const tokenize = (input /*:string*/) /*:string[]*/ => {
  const tokens = []
  let match = null
  let offset = 0
  while ((match = CELL_PATTERN.exec(input))) {
    const start = offset
    const end = match.index + match[0].length
    const token = input.slice(start, end)
    tokens.push(token.trim())
    offset = end + 1
  }

  if (offset > 0 && offset < input.length) {
    tokens.push(input.slice(offset))
  }

  return tokens
}

const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*$)/gm
