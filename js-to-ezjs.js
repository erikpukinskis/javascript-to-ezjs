var library = require("module-library")(require)

module.exports = library.export(
  "javascript-to-ezjs",
  ["an-expression", "parse-a-little-js"],
  function(anExpression, parseALittleJs) {

    var stack

    function log() {
      if (!javascriptToEzjs.loud) { return }
      var args = Array.prototype.slice.call(arguments)
      console.log.apply(console, args)
    }

    // javascriptTo.loud = true

    function toEzjs(source) {
      if (!source) { return }

      source = source.trim()

      if (source.length < 1) { return }

      var tree = this

      var segments = parseALittleJs(source)
      var outro = segments.outro

      var outroOnly = outro && outro.length > 0 && !segments.middle && !segments.intro && !segments.identifierIsh

      if (outroOnly) {
        var closer = outro.slice(0,1)
        var remainder = outro.slice(1)+outro.remainder||""
        log("  *  closer", source)
        pop(stack, closer)
        toEzjs.call(tree, remainder)
        return
      }

      var expression = parseALittleJs.detectExpression(segments)

      expression.id = anExpression.id()
      if (expression.kind != "function literal") {
        ensureRoot(tree)
      }
      expression.index = tree.reservePosition()

      if (expression.kind == "function literal") {

        log("  *  function literal start!", source)

        expression.body = []

        addToParent(stack, expression, tree)

        stack.push(expression)

        toEzjs.call(tree, segments.remainder)

      } else if (expression.kind == "function call") {
        log("  *  function call start!", source)
        expression.arguments = []
        addToParent(stack, expression, tree)
        stack.push(expression)

        toEzjs.call(tree, segments.remainder)

      } else if (expression.kind == "leaf expression") {

        addToParent(stack, expression, tree)

        add(expression, tree)

        log("  *  leaf expression!", source)
      } else {
        throw new Error(" !!! don't understand: "+source)
      }


    }

    function add(expression, tree) {
      addAt(tree.reservePosition(), expression, tree)
    }

    function addAt(index, expression, tree) {

      var functionLiteral = expression.lineIn
      var parent = expression.parentToAdd || functionLiteral

      delete expression.parentToAdd
      delete expression.lineIn
      delete expression.index

      if (functionLiteral) {
        log("  + Adding "+expression.kind+" ("+expression.id+") line at "+index+" to "+functionLiteral.id)
        tree.addLine(functionLiteral, index, expression)
      } else {
        log("  + Adding "+expression.kind+" ("+expression.id+") at "+index)
        tree.addExpressionAt(index, expression)
      }

      if (parent && typeof parent.index != "undefined") {
        log("  + PARENT "+parent.id)
        addAt(parent.index, parent, tree)
        delete parent.index
      }
    }

    function pop(stack, closer) {
      var top = stack.pop()

      if (!top || top.kind != kindsForCloser[closer]) {
        throw new Error("Thought we were closing an "+kind+", but the top of the stack is "+(top && what(top)))
      }

      return top
    }

    var kindsForCloser = {
      ")": "function call",
      "}": "function literal",
    }

    function ensureRoot(tree) {
      if (!tree.rootId()) {
        var position = tree.reservePosition()
        if (position != 0) {
          throw new Error("Tree has no root, but we already reserved positions")
        }
        tree.addExpressionAt(0, anExpression.functionLiteral())
      }
    }

    function addToParent(stack, item, tree) {
      var parent = stack[stack.length-1]

      if (stack.length < 1) {
        item.lineIn = tree.rootId()
        addAt(item.index, item, tree)
        return
      }

      var message = " --> adding "+what(item)+" ("+item.id+") to "+what(parent)

      switch (parent.kind) {
        case "function literal":
          item.lineIn = parent.id
          break;
        case "function call":
          message += " as argument"
          parent.arguments.push(item.id)
          break;
        case "array literal":
          parent.items.push(item.id)
          break;
        case "return statement":
          parent.expression = item.id
          item.parentToAdd = parent
          pop(stack, "return statement")
          break;
        case "variable assignment":
          parent.expression = item.id
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
        case "boolean":
          return "boolean "+it.value.toString()
        default:
          throw new Error("Don't know what "+it.kind+" is")
      }
    }

    function javascriptToEzjs(source, tree) {
      stack = []
      var lines = source.split("\n")

      log("\nOriginal JavaScript:\n"+source+"\n")

      if (!tree) {
        tree = anExpression.tree()
      }

      lines.forEach(function(line) {
        toEzjs.call(tree, line)
      })

      if (stack.length) {
        var root = stack.pop()
        if (stack.length) {
          debugger
          throw new Error("extra stuff on the stack?")
        } else if (typeof root.index == "undefined") {
          debugger
          throw new Error("something left on the stack with no index?")
        } else if (root.index != 0) {
          throw new Error("left something on the stack other than the root?")
        } else {
          addAt(root.index, root, tree)
        }
      }

      log("\nFinished expression. Root is "+tree.rootId()+"\n")
      cache = []

      javascriptToEzjs.loud = false
      stack = undefined
      return tree
    }


    // This lets you JSON.parse circular objects like: JSON.parse(foo = {a: foo}, withCircularDependencies, 2)

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