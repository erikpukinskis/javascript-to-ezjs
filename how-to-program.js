var library = require("module-library")(require)

library.using([
  library.ref(),
  "web-site",
  "web-element",
  "browser-bridge",
  "basic-styles",
  "child_process",
  "bridge-module",
  "make-request"],
  function(lib, WebSite, element, BrowserBridge, basicStyles, childProcess, bridgeModule, _) {
    var site = new WebSite()
    site.start(3444)

    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)

    var runTests = baseBridge.defineFunction([
        bridgeModule(
          lib,
          "make-request",
          baseBridge),
        bridgeModule(
          lib,
          "add-html",
          baseBridge),
        bridgeModule(
          lib,
          "web-element",
          baseBridge)],
      function(makeRequest, addHtml, element) {
        makeRequest({
          "method": "get",
          "path": "/test"}, 
          function(data) {
            var error = JSON.parse(data).error
            if (error) {
              var el = element(
                ".what-does-this-mean",
                element("h2", "what does this mean?"),
                element("p", error))
              addHtml(el.html())
            }})
      })

    site.addRoute(
      "get",
      "/",
      function(_, response) {
        var button = element(
          "button",
          "Run tests",{
          "onclick": runTests.evalable()})
        var bridge = baseBridge.forResponse(
          response)
        bridge.send(
          button)})

    function testLine(response, line) {
      var errorMatch = line.match(/Error: (.*)/)
      if (errorMatch) {
        response.json({
          "error": errorMatch[1]})
        return true
      } else {
        // console.log("LINE >>> ", line)
      }
    }

    site.addRoute(
      "get",
      "/test",
      function(_, response) {
        const child = childProcess.spawn(
          "node", ["test"])

        var responded = false

        child.stdout.on(
          "data", 
          function(chunk) {
            var lines = chunk.asciiSlice().split("\n")
            responded = lines.some(testLine.bind(null, response)) || responded
          })

        child.stdout.on(
          "error",
          function(error) {
            console.log("oops", error)})

        child.on(
          "close",
          function(code) {
            if (!responded) {
              response.json({success: True})}
          })

      })

  })
