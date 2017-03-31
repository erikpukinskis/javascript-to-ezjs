var library = require("module-library")(require)

library.using(
  ["./", "an-expression", "tell-the-universe"],
  function(javascriptToEzjs, anExpression, tellTheUniverse) {

    function buildAHouse(issueBond, showSource, library, renderBond) {
      var buildPanel = issueBond([
        "cut studs to length",
        "cut track to length",
        "crimp",
        "add sheathing",
        "flipsulate",
        "add sheathing"]
      )

      issueBond.expense(
        buildPanel,
        "labor",
        "$100"
      )

      checkBook(
        "someString",
        {"one of": 1001, "two-w3":2222}
      )

      showSource.hostModule(
        library,
        "render-bond",
        buildPanel
      )

      return buildPanel
    }


    // console.log("rendering", buildAHouse.toString())

    var universe = tellTheUniverse.called("demo-module").withNames({anExpression: "an-expression"})

    // javascriptToEzjs.loud = true

    var tree = javascriptToEzjs(buildAHouse.toString(), universe)

    var id = tree.id

    console.log("literal has "+tree.root().body.length+" lines")

    console.log("initial tree", id, ":")
    _wtf()

    setTimeout(function() {
      anExpression.forgetTrees()

      tree = anExpression.getTree(id)

      console.log("forgot trees. "+id+" = "+JSON.stringify(tree))

      universe.playItBack()

      console.log("now tree "+id+" is:")

      tree = anExpression.getTree(id)
      _wtf(tree)

      console.log("\n===\nORIGINAL JAVASCRIPT\n"+buildAHouse.toString()+"\n===\n")
        
      console.log("\n===\nRECONSTRUCTURED SOURCE\n"+anExpression.toJavascript(tree.root())+"\n===\n")
    }, 2000)


  }
)