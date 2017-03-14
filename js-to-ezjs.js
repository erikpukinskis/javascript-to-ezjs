var library = require("module-library")(require)

module.exports = library.export(
  "javascript-to-ezjs",
  ["an-expression"],
  function(anExpression) {

    var stack = []

    function jsToEzjs(source) {
      var lines = source.split("\n")
  
      if (lines.length > 1) {
        lines.forEach(jsToEzjs)
        return expression
      } else {
        source = source.trim()
      }

      var functionLiteralStart = source.match(/^ *function ?([^(]*) ?([(][^)]*[)])/)

      var functionCallStart = source.match(/^([^ ,"'(){}]+)[(](.*)$/)

      var stringLiteral = source.match(/^(".*"),?$/)

      var arrayLiteralStart = source.match(/^\[$/)

      if (functionLiteralStart) {
        var name = functionLiteralStart[1]

        expression = {
          kind: "function literal",
          body: [],
          id: anExpression.id(),
        }

        console.log("function literal start!", source)

        if (name.length > 0) {
          expression.functionName = name
        }

        expression.argumentNames = argumentNames(functionLiteralStart[2])

        expression.body = []

        stack.push(expression)
      } else if (functionCallStart) {
        console.log("function call start!", source)

        var call = {
          kind: "function call",
          functionName: functionCallStart[1],
          arguments: [],
          id: anExpression.id()
        }

        addToParent(stack, call)
        stack.push(call)

        jsToEzjs(functionCallStart[2])

      } else if (stringLiteral) {
        var literal = {
          kind: "string literal",
          string: eval(stringLiteral[1])
        }

        addToParent(stack, literal)

        console.log("string literal!", source)
      } else if (arrayLiteralStart) {
        console.log("array literal!", source)
        var arr = {
          kind: "array literal",
          items: [],
          id: anExpression.id(),
        }
        addToParent(stack, arr)

        stack.push(arr)
      } else {
        console.log("don't understand:", source)
      }
    }

    function addToParent(stack, item) {
      var parent = stack[stack.length-1]
      switch (parent.kind) {
        case "function literal":
          parent.body.push(item)
          console.log("added body[0]", parent.body[0])
          break;
        case "function call":
          parent.arguments.push(item)
          break;
        case "array literal":
          parent.items.push(item)
          break;
        default:
          throw new Error("Don't know how to add to a "+parent+" expression")
      }
    }

    // function addCallArgs(call, match) {
    //   var argSources = match[2].split(",")

    //   for(var i=0; i<argSources.length; i++) {
    //     var arg = jsToEzjs(argSources[i])
    //     if (arg) {
    //       call.arguments.push(arg)
    //     }
    //   }
    // }

    function argumentNames(func) {
      if (typeof func == "string") {
        var firstLine = func
      } else {
        var firstLine = func.toString().match(/.*/)[0]
      }

      var argString = firstLine.match(/[(]([^)]*)/)[1]

      var args = argString.split(/, */)

      var names = []
      for(var i=0; i<args.length; i++) {
        if (args[i].length > 0) {
          names.push(args[i])
        }
      }

      return names
    }
    return jsToEzjs
  }
)