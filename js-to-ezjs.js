var library = require("module-library")(require)

module.exports = library.export(
  "javascript-to-ezjs",
  ["an-expression"],
  function(anExpression) {

    var stack = []

    function log() {
      if (!javascriptToEzjs.loud) { return }
      var args = Array.prototype.slice.call(arguments)
      console.log.apply(console, args)
    }

    // javascriptTo.loud = true

    function toEzjs(source) {

      source = source.trim()

      if (source.length < 1) { return }

      var tree = this

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
        addToParent(stack, expression, tree)
        stack.push(expression)
        log("  *  return statement!", source)
        toEzjs.call(tree, returnStatement[1])

      } else if (variableAssignment) {
        expression = {
          kind: "variable assignment",
          id: anExpression.id(),
          variableName: variableAssignment[1],
          isDeclaration: true,
          i: tree.reservePosition(),
        }

        addToParent(stack, expression, tree)

        stack.push(expression)
        log("  *  assignment!", source)
        toEzjs.call(tree, variableAssignment[2])

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

        addToParent(stack, expression, tree)

        add(expression, tree)

        stack.push(expression)

        return expression

      } else if (functionLiteralEnd) {
        // toEzjs.call(tree, functionLiteralEnd[1])
        log("  *  function literal end!", source)
        pop(stack, "function literal")

      } else if (functionCallStart) {
        log("  *  function call start!", source)

        var call = {
          kind: "function call",
          id: anExpression.id(),
          functionName: functionCallStart[1],
          arguments: [],
          i: tree.reservePosition(),
        }

        addToParent(stack, call, tree)
        stack.push(call)

        toEzjs.call(tree, functionCallStart[2])

      } else if (functionCallEnd) {
        toEzjs.call(tree, functionCallEnd[1])

        var expression = pop(stack, "function call")

        addAt(expression.i, expression, tree)

        log("  *  call end!", source)

      } else if (stringLiteral) {
        var literal = {
          kind: "string literal",
          id: anExpression.id(),
          string: eval(stringLiteral[1]),
        }

        addToParent(stack, literal, tree)

        add(literal, tree)

        log("  *  string literal!", source)
      } else if (objectLiteral) {
        try {
          var obj = JSON.parse(source)
        } catch (e) {
          console.log("The source code "+source+" looked like an object, but it failed to parse. Objects need to be valid JSON")
        }

        var literal = anExpression.objectLiteral(obj)

        var i = tree.reservePosition()

        for(var i=0; i<literal.keys.length; i++) {
          var valueExpression = literal.values[i]
          add(valueExpression, tree)
        }

        addToParent(stack, literal, tree)

        addAt(i, literal, tree)

        log("  *  object literal!", source)

      } else if (arrayLiteralStart) {
        log("  *  array literal!", source)
        var arr = {
          kind: "array literal",
          id: anExpression.id(),
          items: [],
          i: tree.reservePosition()
        }
        addToParent(stack, arr, tree)

        stack.push(arr)
      } else if (arrayLiteralEnd) {
        toEzjs.call(tree, arrayLiteralEnd[1])
        var arr = pop(stack, "array literal")
        addAt(arr.i, arr, tree)
        log("  *  array end!", source)
      } else {

        understood = false

        // ROUND 2 of matching!

        var argumentString = source.match(/(.*,.*)([)]?)/)

        var booleanLiteral = !argumentString && source.match(/^(true|false)$/)

        var numberLiteral = !booleanLiteral && source.match(/^[0-9][0-9.]*$/)

        var reference = !numberLiteral && source.match(/^[^ -(){}.]+$/)
      }

      if (understood) {
        // we're good

      } else if (argumentString) {
        log("  *  argument string!", source)

        var argSources = argumentString[0].split(",")

        argSources.forEach(toEzjs.bind(tree))

      } else if (numberLiteral) {
        log("  *  number literal!", source)

        var literal = {
          kind: "number literal",
          id: anExpression.id(),
          number: eval(source),
        }

        addToParent(stack, literal, tree)

        add(literal, tree)

      } else if (reference) {
        log("  *  reference!", source)

        var ref = {
          kind: "variable reference",
          id: anExpression.id(),
          variableName: source,
        }

        addToParent(stack, ref, tree)

        add(ref, tree)

      } else {
        log(" !!! don't understand:", source)
      }


    }

    function add(expression, tree) {
      addAt(tree.reservePosition(), expression, tree)
    }

    function addAt(i, expression, tree) {

      var functionLiteral = expression.lineIn

      if (functionLiteral) {
        tree.addLine(expression, i, functionLiteral)
      } else {
        tree.addExpressionAt(expression, i)
      }

      var parent = expression.parentToAdd

      if (parent) {
        addAt(parent.i, parent, tree)
      }

      delete expression.parentToAdd
      delete expression.lineIn
      delete expression.i
    }

    function pop(stack, kind) {
      var top = stack.pop()

      if (!top || top.kind != kind) {
        throw new Error("Thought we were closing an "+kind+", but the top of the stack is "+(top && what(top)))
      }

      return top
    }

    function addToParent(stack, item, tree) {
      var parent = stack[stack.length-1]

      if (stack.length < 1) {
        log(" !!! no parent to add to")
        return
      }

      var message = " --> adding "+what(item)+" to "+what(parent)

      switch (parent.kind) {
        case "function literal":
          item.lineIn = parent
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
          item.parentToAdd = parent
          pop(stack, "return statement")
          break;
        case "variable assignment":
          parent.expression = item
          item.parentToAdd = parent
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
          return "object with keys "+JSON.stringify(it.keys)
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

    function javascriptToEzjs(source, universe) {
      var lines = source.split("\n")

      log("\nOriginal JavaScript:\n"+source+"\n")

      var tree = anExpression.tree()
      if (universe) {
        tree.logTo(universe)
      }

      lines.forEach(function(line) {
        toEzjs.call(tree, line)
      })

      log("\nFinished expression:\n"+JSON.stringify(tree.root(), withCircularDependecies, 2)+"\n")
      cache = []

      javascriptToEzjs.loud = false

      return tree
    }


    var cache = []
    function withCircularDependecies(key, value) {
      if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
              // Circular reference found, discard key
              return "<<< CIRCULAR REF: "+value.id+" >>>"
          }
          // Store value in our collection
          cache.push(value);
      }
      return value;
    }


    return javascriptToEzjs
  }
)