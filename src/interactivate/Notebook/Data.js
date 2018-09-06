// @flow strict

/*::
export type Model = {
  url:string;
}
*/

export const init = () => ({ url: "temp://" })
export const load = (location /*:string*/) => ({ url: `dat://${location}` })
