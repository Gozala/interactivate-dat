// @flow strict

import * as Decoder from "../../Decoder.flow/Decoder.js"

export const publish = Decoder.ok({
  message: {
    tag: "publish",
    value: true
  }
})
