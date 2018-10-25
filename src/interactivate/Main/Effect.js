// @flow strict

import { navigate, load } from "../../elm/navigation.js"
import { writeFile } from "../../io/dat.js"

export const save = writeFile

export { navigate, load }
