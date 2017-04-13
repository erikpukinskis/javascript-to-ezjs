var runTest = require("run-test")(require)

runTest(
  "rebuild tree from log",
  ["./", "tell-the-universe", "an-expression"],
  function(expect, done, jsToEz, tellTheUniverse, anExpression) {

    function bar() {}

    var universe = tellTheUniverse.called("test").withNames({anExpression: "an-expression"})

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
    var expr = tree.root()

    expect(tree.expressionIds.length).to.equal(7)

    var bless = expr.body[0]
    expect(bless.arguments[0].kind).to.equal("variable reference")
  
    var upTo = expr.body[1]
    expect(upTo.arguments[0].kind).to.equal("number literal")
    expect(upTo.arguments[1].kind).to.equal("variable reference")

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

    var expr = jsToEz(foo.toString()).root()

    expect(expr.kind).to.equal("function literal")

    var tootCall = expr.body[0]
    expect(tootCall.kind).to.equal("function call")

    var array = tootCall.arguments[0]
    expect(array.kind).to.equal("array literal")

    var frootCall = expr.body[1]
    expect(frootCall.kind).to.equal("function call")

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

    var expr = jsToEz(foo.toString()).root()

    var fun = expr.body[0]
    expect(fun.arguments[0].kind).to.equal("function literal")

    expect(fun.arguments[0].body[0].functionName).to.equal("boo")

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

    var expr = jsToEz(foo.toString()).root()

    expect(expr.body[0].kind).to.equal("return statement")

    var obj = expr.body[0].expression

    expect(obj.kind).to.equal("object literal")

    expect(obj.values[0].string).to.equal("/housing-bond/tiny.jpg")
    expect(obj.keys[0]).to.equal("src")

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
            {"src": "/housing-bond/tiny.jpg"}
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
