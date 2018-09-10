;(async () => {
  const wait = event => {
    const script = event.target
    const { resolve, reject, url } = script
    script.onerror = null
    script.onload = null
    script.resolve = null
    script.reject = null
    script.remove()
    script.src = ""
    switch (event.type) {
      case "load":
        return resolve(url)
      case "error":
        return reject(new Error(`Failed to import: ${url}`))
    }
  }

  const load = version =>
    new Promise((resolve, reject) => {
      const url = `dat://${location.host}+${version}/src/interactivate.js`
      const script = document.createElement("script")
      script.defer = "defer"
      script.async = "async"
      script.type = "module"
      script.src = url
      script.resolve = resolve
      script.reject = reject
      script.onerror = wait
      script.onload = wait
      document.head.appendChild(script)
    })

  if (location.protocol === "dat:") {
    const archive = await DatArchive.load(`dat://${location.host}`)
    const script = document.createElement("script")
    script.type = "module"

    const { isOwner, version } = await archive.getInfo()
    await load(version)

    if (isOwner) {
      const watcher = archive.watch(["*.js", "**/*.js"])
      watcher.addEventListener("changed", async ({ path }) => {
        console.log(`Reload application since document has changed ${path}`)

        const { version } = await archive.getInfo()
        if (window.watch !== false) {
          console.log(`Loading version ${version}`)
          await load(version)
        }
      })
    }
  }
})()
