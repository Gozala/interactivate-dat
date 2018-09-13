// @flow strict

import { future } from "../elm/Future.js"

export const focus = future(async id => {
  const element = document.getElementById(id)
  if (element != null) {
    element.focus()
  } else {
    throw Error(`Element with #${id} not found`)
  }
})
