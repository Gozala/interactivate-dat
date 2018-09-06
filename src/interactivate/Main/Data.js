// @flow strict

/*::
import * as Notebook from "../Notebook.js"

export type Model = {
  notebook: Notebook.Model
}
*/

export const init = (notebook /*:Notebook.Model*/) /*:Model*/ => ({
  notebook
})

export const updateNotebook = (
  state /*:Model*/,
  notebook /*:Notebook.Model*/
) /*:Model*/ => ({
  ...state,
  notebook
})
