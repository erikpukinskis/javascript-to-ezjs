var runTest = require("run-test")(require)

runTest("One line per expression, except function calls can only have variable references, numbers, booleans inline")

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

    console.log("\nFunction:\n", foo.toString()+"\n")

    var expr = jsToEz(foo.toString())

    console.log("\nExpression: \n", JSON.stringify(expr, null, 2))

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

