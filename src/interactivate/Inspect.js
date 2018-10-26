// @flow strict

import { nofx } from "../reflex/Effect.js"
import { always } from "../reflex/Basics.js"
import { text, code, output } from "../reflex/Element.js"
import * as Widget from "../reflex/Widget.js"

// /*::
// export type Transaction<message, model> = Widget.Transaction<message, model>
// export type Node<message> = Widget.Node<message>
// export type Inspector<message, model> = Widget.Program<message, model, Node<message>, model>
// export type Printer<message, model> = Widget.Widget<message, model, Node<message>, Element, model>
// */

// export const inspect = /*::<message, model>*/ (
//   value /*:model*/
// ) /*:Printer<message, model>*/ => {
//   if (typeof value === "boolean") {
//     return Widget.spawn(boolean, value, document.createElement("output"))
//   }
//   return Widget.spawn(
//     inspectorFor(value),
//     value,
//     document.createElement("output")
//   )
// }

// const inspectorFor = /*::<model>*/ (
//   value /*:model*/
// ) /*:Inspector<any, model>*/ => {
//   switch (typeof value) {
//     case "boolean": {
//       return boolean
//     }
//     default: {
//       return plain
//     }
//   }
// }

// const inspector = /*::<message, model>*/ (
//   init /*:model => Transaction<message, model>*/,
//   update /*:(message, model) => Transaction<message, model>*/,
//   view /*:model => Node<message>*/
// ) => ({ init, update, view })

// const pure = view =>
//   inspector(state => [state, nofx], (_, state) => [state, nofx], view)

// const plain = pure(state => {
//   code([], [text(String(state))])
// })

// const boolean /*:Inspector<any, boolean>*/ = pure(value => {
//   code([], [text(String(value))])
// })

// const $init = Symbol.for("interactive.init")
// const $update = Symbol.for("interactivate.update")
// const $view = Symbol.for("interactivate.view")

// const init = <message, model>(state) => [state, nofx]
// const upadte = <message, model>(payload, state) => [state, nofx]
// const view = /*::<message, model>*/ (state /*:model*/) /*:Node<message>*/ => {
//   const viewer = Object(state)[$view]
// }

// interface Inspector<a> {
//   send(a):void;
// }
