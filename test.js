var runTest = require("run-test")(require)


// runTest.only("parses log lines")
// runTest.only("rebuild tree from log")

runTest(
  "parses log lines",
  ["./"],
  function(expect, done, jsToEz) {

    function foo() {
      someFunc("arg", "two", 3)
    }

    // jsToEz.loud = true

    var tree = jsToEz(foo.toString())

    var funcId = tree.rootId()

    var callId = tree.getListItem("body", funcId, 0)

    expect(callId.length).to.be.above(3)
    done.ish("got something from the body")

    var firstArg = tree.getListItem("arguments", callId, 0)
    expect(firstArg.length).to.be.above(3)
    done.ish("got an argument")

    var secondArg = tree.getListItem("arguments", callId, 1)
    var thirdArg = tree.getListItem("arguments", callId, 2)
    expect(tree.getAttribute("string", firstArg)).to.equal("arg")
    done.ish("first arg is correct")

    expect(tree.getAttribute("string", secondArg)).to.equal("two")

    expect(tree.getAttribute("number", thirdArg)).to.equal(3)

    done()
  }
)


runTest(
  "rebuild tree from log",
  ["./", "tell-the-universe", "an-expression"],
  function(expect, done, jsToEz, tellTheUniverse, anExpression) {

    function bar() {}

    var universe = tellTheUniverse.called("test").withNames({anExpression: "an-expression"})

    jsToEz.loud = true

    var tree = anExpression.tree()
    tree.logTo(universe)
    universe("anExpression.tree", tree.id)
    jsToEz(bar.toString(), tree)

    anExpression.forgetTrees()

    expect(anExpression.getTree(tree.id)).to.be.undefined

    universe.playItBack()

    var reincarnated = anExpression.getTree(tree.id)

    expect(reincarnated.expressionIds.length).to.equal(1)

    done()
  }
)

runTest(
  "function calls can have variable references, numbers, booleans inline",
  ["./"],
  function(expect, done, jsToEz) {

    function foo() {
      bless(this,
        "house"
      )
      upTo(1, house)
    }

    // jsToEz.loud = true

    var tree = jsToEz(foo.toString())
    var root = tree.rootId()

    expect(tree.expressionIds.length).to.equal(7)

    var blessId = tree.getListItem("body", root, 0)
    var thisId = tree.getListItem("arguments", blessId, 0)

    expect(tree.getAttribute("kind", thisId)).to.equal("variable reference")
  
    var upTo = tree.getListItem("body", root, 1)
    var oneId = tree.getListItem("arguments", upTo, 0)
    var houseId = tree.getListItem("arguments", upTo, 1)
    expect(tree.getAttribute("kind", oneId)).to.equal("number literal")
    expect(tree.getAttribute("kind", houseId)).to.equal("variable reference")

    done()
  }
)

runTest(
  "Array literal arguments need to have items on new lines",
  ["./"],
  function(expect, done, jsToEz) {
    function foo() {
      toot([
        "karma",
      ])
      froot()
    }

    // jsToEz.loud = true

    var tree = jsToEz(foo.toString())
    var root = tree.rootId()

    expect(tree.getAttribute("kind", root)).to.equal("function literal")

    var tootCall = tree.getListItem("body", root, 0)
    expect(tree.getAttribute("kind", tootCall)).to.equal("function call")

    var array = tree.getListItem("arguments", tootCall, 0)
    expect(tree.getAttribute("kind", array)).to.equal("array literal")

    var frootCall = tree.getListItem("body", root, 1)
    expect(tree.getAttribute("kind", frootCall)).to.equal("function call")

    done()
  }
)

runTest(
  "function literals args",
  ["./"],
  function(expect, done, jsToEz) {

    function foo() {
      fun(
        function() {
          boo()
        }
      )
    }

    // jsToEz.loud = true

    var tree = jsToEz(foo.toString())
    var root = tree.rootId()

    var fun = tree.getListItem("body", root, 0)
    var firstArg = tree.getListItem("arguments", fun, 0)
    expect(tree.getAttribute("kind", firstArg)).to.equal("function literal")

    var boo = tree.getListItem("body", firstArg, 0)
    expect(tree.getAttribute("functionName", boo)).to.equal("boo")

    done()
  }
)

runTest(
  "understand objects and returns",
  ["./"],
  function(expect, done, jsToEz) {

    function foo() {
      return {"src": "/housing-bond/tiny.jpg"}
    }

    // jsToEz.loud = true

    var tree = jsToEz(foo.toString())
    var foo = tree.rootId()
    var firstLine = tree.getListItem("body", foo, 0)

    expect(tree.getAttribute("kind", firstLine)).to.equal("return statement")

    var obj = tree.getAttribute("expression", firstLine)

    expect(tree.getAttribute("kind", obj)).to.equal("object literal")

    var pairId = tree.getListItem("pairIds", obj, 0)
    var value = tree.getAttribute("valueId", pairId)
    var key = tree.getAttribute("key", pairId)

    expect(tree.getAttribute("string", value)).to.equal("/housing-bond/tiny.jpg")

    expect(key).to.equal("src")

    done()
  }
)


runTest(
  "understand a real function",
  ["./"],
  function(expect, done, jsToEz) {

    function foo(element, basicStyles) {

      function renderPitch(voxel) {

        var letter = element([
          element(
            "img.hero",
            {"src": "/housing-bond/tiny.jpg"},
            function() {
              true
            }
          ),
          element(
            "Dear friends,"
          ),
        ])
      }

      return renderPitch
    }

    // jsToEz.loud = true

    jsToEz(foo.toString())

    done()

  }
)
