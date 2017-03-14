**javascript-to-ezjs** converts a JavaScript string into a JSON-like data structure that you can manipulate. See [an-expression](https://www.npmjs.com/package/an-expression).

Rather than attempting to parse every possible JavaScript program, it only understands a very small subset of language features, and it forces you to be very careful with syntax.

##Allowed expressions

* variable assignment
* variable references
* function calls
* function literals
* string literals
* number literals
* object literals
* booleans

That's it. Notably missing right now are loops, conditionals, constructors, and methods. Some of these may be added later to the extent we can do so without adding complexity.

## String, function, and object literals on new lines

You can use variables, functions, numbers, and booleans as inline function arguments (`setCount(42, true)`) but you must put strings and functions on their own line:

```javascript
function() {
  site.addRoute(
    "get",
    "/foo/:bar",
    function(voxel) {
      ...
    }
  )
}
```

Same applies to object literals, which must be confined to a single line.

This makes parsing simpler.

## Why

We needed a simple JavaScript importer for render-expression.

JavaScript has been adding language features like the kitchen sink lately. This has left an opening in the market for a language with few features that runs on every device. There is a subset of JavaScript which still serves that purpose. This module is a straw man attempting to define that subset.

There may be unseen benefits to having a language subset that is incredibly easy to parse, without grammatical ambiguities.

This allows us to use JavaScript to serialize/deserialize anExpression. JavaScript is a little more compact than the raw anExpression JSON.

