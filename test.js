var runTest = require("run-test")(require)

// runTest.only("function calls can have variable references, numbers, booleans inline")

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

    // console.log("\nFunction:\n", foo.toString()+"\n")

    var expr = jsToEz(foo.toString())

    // console.log("\nExpression: \n", JSON.stringify(expr, null, 2))

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

    // console.log("\nFunction:\n", foo.toString()+"\n")

    var expr = jsToEz(foo.toString())

    // console.log("\nExpression: \n", JSON.stringify(expr, null, 2))

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

runTest("Call args that are string literals, function literals, object literals are always on new lines")

