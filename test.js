var runTest = require("run-test")(require)

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

    // console.log("\nFunction:\n", foo.toString()+"\n")

    var expr = jsToEz(foo.toString())

    // console.log("\nExpression: \n", JSON.stringify(expr, null, 2))

    var fun = expr.body[0]
    expect(fun.arguments[0].kind).to.equal("function literal")

    expect(fun.arguments[0].body[0].functionName).to.equal("boo")

    done()
  }
)

runTest("object literal args")


