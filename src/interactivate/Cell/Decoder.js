// @flow strict

/*::
import type { EventDecoder } from "../../elm/virtual-dom.js"
*/
import * as Inbox from "./Inbox.js"
import * as Decoder from "../../Decoder.flow/Decoder.js"

export const change = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("change"),
    value: Decoder.field("detail", Decoder.String)
  })
})

export const escape = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("leave"),
    value: Decoder.at(
      ["detail", "dir"],
      Decoder.or(Decoder.match(-1), Decoder.match(1))
    )
  })
})

export const split = Decoder.ok({ message: { tag: "split" } })
// decoder((event /*:Event*/) => {
//   const detail = readProperty(String, "detail", event)
//   const message = Inbox.change(detail)
//   return { message }
// })
