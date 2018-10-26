// @flow strict

import { navigate, load } from "../../reflex/Navigation.js"
import { writeFile } from "../../io/dat.js"

export const save = writeFile

export { navigate, load }
