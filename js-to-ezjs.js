var library = require("module-library")(require)

module.exports = library.export(
  "javascript-to-ezjs",
  ["an-expression"],
  function(anExpression) {

    var stack = []

    function log() {
      if (!jsToEzjs.loud) { return }
      var args = Array.prototype.slice.call(arguments)
      console.log.apply(console, args)
    }

    jsToEzjs.loud = true

    function jsToEzjs(source) {
      if (source.length < 1) { return }

      var lines = source.split("\n")
  
      if (lines.length > 1) {
        var out = undefined

        log("\nOriginal JavaScript:\n"+source+"\n")
        lines.forEach(function(line) {
          var newExpr = jsToEzjs(line)

          if (newExpr && !out) {
            out = newExpr
          }
        })

        log("\nFinished expression:\n"+JSON.stringify(out, null, 2)+"\n")

        jsToEzjs.loud = false

        return out

      } else {
        source = source.trim()
      }

      var functionLiteralStart = source.match(/^ *function ?([^(]*) ?([(][^)]*[)])/)
      var functionLiteralEnd = !functionLiteralStart && source.match(/^\}$/)

      var functionCallStart = !functionLiteralEnd && source.match(/^([^ ,"'(){}]+)[(](.*)$/)
      var functionCallEnd = !functionCallStart && source.match(/^(.*)\)$/)

      var stringLiteral = !functionCallEnd && source.match(/^(".*"),?$/)

      var arrayLiteralStart = !stringLiteral && source.match(/^\[$/)
      var arrayLiteralEnd = !arrayLiteralStart && source.match(/^(.*)\]$/)

      var objectLiteral = !arrayLiteralEnd && source.match(/^\{[^:]+:/)

      var comment = !objectLiteral && source.match(/^\/\//)

      var returnStatement = !comment && source.match(/^return (.*)$/)

      var variableAssignment = !returnStatement && source.match(/^var ([^-{(]+) *= *(.*)$/)

      var understood = true

      if (comment) {
        // do nothing

      } else if (returnStatement) {
        expression = {
          kind: "return statement",
          id: anExpression.id(),
        }
        addToParent(stack, expression)
        stack.push(expression)
        log("  *  return statement!", source)
        jsToEzjs(returnStatement[1])

      } else if (variableAssignment) {
        expression = {
          kind: "variable assignment",
          id: anExpression.id(),
          variableName: variableAssignment[1],
        }
        addToParent(stack, expression)
        stack.push(expression)
        log("  *  assignment!", source)
        jsToEzjs(variableAssignment[2])

      } else if (functionLiteralStart) {
        var name = functionLiteralStart[1]

        expression = {
          kind: "function literal",
          id: anExpression.id(),
        }

        log("  *  function literal start!", source)

        if (name.length > 0) {
          expression.functionName = name
        }

        expression.argumentNames = argumentNames(functionLiteralStart[2])

        expression.body = []

        addToParent(stack, expression)
        stack.push(expression)

        return expression

      } else if (functionLiteralEnd) {
        // jsToEzjs(functionLiteralEnd[1])
        log("  *  function literal end!", source)
        pop(stack, "function literal")

      } else if (functionCallStart) {
        log("  *  function call start!", source)

        var call = {
          kind: "function call",
          id: anExpression.id(),
          functionName: functionCallStart[1],
          arguments: [],
        }

        addToParent(stack, call)
        stack.push(call)

        jsToEzjs(functionCallStart[2])

      } else if (functionCallEnd) {
        jsToEzjs(functionCallEnd[1])
        stack.pop(stack, "function call")
        log("  *  call end!", source)

      } else if (stringLiteral) {
        var literal = {
          kind: "string literal",
          id: anExpression.id(),
          string: eval(stringLiteral[1]),
        }

        addToParent(stack, literal)

        log("  *  string literal!", source)
      } else if (objectLiteral) {
        try {
          var obj = JSON.parse(source)
        } catch (e) {
          console.log("The source code "+source+" looked like an object, but it failed to parse. Objects need to be valid JSON")
        }

        var literal = anExpression.objectLiteral(obj)
        addToParent(stack, literal)
        log("  *  object literal!", source)

      } else if (arrayLiteralStart) {
        log("  *  array literal!", source)
        var arr = {
          kind: "array literal",
          id: anExpression.id(),
          items: [],
        }
        addToParent(stack, arr)

        stack.push(arr)
      } else if (arrayLiteralEnd) {
        jsToEzjs(arrayLiteralEnd[1])
        var arr = pop(stack, "array literal")
        log("  *  array end!", source)
      } else {

        understood = false

        // ROUND 2 of matching!

        var argumentString = source.match(/(.*,.*)([)]?)/)

        var booleanLiteral = !argumentString && source.match(/^(true|false)$/)

        var numberLiteral = !booleanLiteral && source.match(/^[0-9.]*$/)

        var reference = !numberLiteral && source.match(/^[^ -(){}.]+$/)
      }

      if (understood) {
        // we're good

      } else if (argumentString) {
        log("  *  argument string!", source)

        var argSources = argumentString[0].split(",")

        argSources.forEach(jsToEzjs)

      } else if (numberLiteral) {
        log("  *  number literal!", source)

        var literal = {
          kind: "number literal",
          id: anExpression.id(),
          number: eval(source),
        }

        addToParent(stack, literal)

      } else if (reference) {
        log("  *  reference!", source)

        var ref = {
          kind: "variable reference",
          id: anExpression.id(),
          variableName: source,
        }

        addToParent(stack, ref)

      } else {
        log(" !!! don't understand:", source)
      }


    }

    function pop(stack, kind) {
      var top = stack.pop()

      if (!top || top.kind != kind) {
        throw new Error("Thought we were closing an "+kind+", but the top of the stack is "+(top && what(top)))
      }

    }

    function addToParent(stack, item) {
      var parent = stack[stack.length-1]

      if (stack.length < 1) {
        log(" !!! no parent to add to")
        return
      }

      var message = " --> adding "+what(item)+" to "+what(parent)

      switch (parent.kind) {
        case "function literal":
          parent.body.push(item)
          break;
        case "function call":
          message += " as argument"
          parent.arguments.push(item)
          break;
        case "array literal":
          parent.items.push(item)
          break;
        case "return statement":
          parent.expression = item
          pop(stack, "return statement")
          break;
        case "variable assignment":
          parent.expression = item
          pop(stack, "variable assignment")
          break;
        default:
          throw new Error("Don't know how to add to a "+parent+" expression")
      }

      log(message)
    }

    function what(it) {
      if (!it) { return "undefined" }
      switch (it.kind) {
        case "function literal":
          return "function literal"
        case "function call":
          return "calling "+it.functionName
        case "array literal":
          return "array"
        case "variable reference":
          return "reference to var "+it.variableName
        case "variable assignment":
          return "assigning to var "+it.variableName
        case "string literal":
        case "number literal":
          return JSON.stringify(it.string || it.number)
        case "return statement":
          return "returning "+what(it.expression)
        case "object literal":
          return "object with keys "+JSON.stringify(Object.keys(it.valuesByKey))
        default:
          throw new Error("Don't know what "+it.kind+" is")
      }
    }

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