const merge = require("deep-extend")

// super dumb mutation thing
// `deep-extend` which has been named `merge` will mutate the first object
// `updatePath` is used to hide the mutation. It will likely be removed in favor of `babel-template`
const updatePath = (base, current) => merge(base, current) && undefined

// isMethod checks that this ObjectProperty holds a function
// I tried `t.isObjectMethod` from `babel-types` it did not identify any of the methods with the `ObjectProperty` node type
// There is likely a better / more Babel way to do this
// Path -> Boolean
const isMethod = ({
    node: {
      type,
      value
    }
  }) =>
  ({
    // default
    true: false,
    // covers `{ method: Function }`
    [value.type === "Identifier" && value.name === "Function"]: true,
    // covers `{ method: function name(params) { } }`
    [value.type === "FunctionExpression"]: true,
    // covers `{ method: () => {} }`
    [value.type === "ArrowFunctionExpression"]: true
  }.true)

// `Program` is the root element
// I am finding the root element to compare against every `MemberExpression`
// TODO: This can be replaced by first finding all of the `MemberExpression`s first then doing the rest of the traversal
// also `scope.parentBlock` appears to hold the program
const findProgram = path =>
  path.findParent(parentPath => parentPath.isProgram())

module.exports = ({
  types: t
}) => ({
  visitor: {
    ObjectProperty: objectPropertyPath => {
      const name = objectPropertyPath.node.key.name
      if (isMethod(objectPropertyPath)) {
        const program = findProgram(objectPropertyPath)
        // TODO: I could cache all of the expressions first so that we do not traverse every time we find a method

        // from here I need to check the entire source to see if this Identifier is used
        // right now I am not worried about renamed identifiers
        // So I need to filter the path for every path that reflect this path.
        // VariableDeclaration -> Identifier .init.properties -> name "unused"
        //                             |                          |
        //                             _________________        __
        //                                              |      |
        // ExpressionStatement -> MemberExpression -> object property
        program.traverse({
          MemberExpression: memberExpressionPath => {
            if (memberExpressionPath.node.property.name === name) {
              const parentObject = objectPropertyPath.findParent(
                parentPath => parentPath.type === "VariableDeclarator"
              )
              if (
                parentObject.node.id.name ===
                memberExpressionPath.node.object.name
              ) {
                console.log(`${name} was used`)
              } else {
                console.log(`${name} was not used`)
                objectPropertyPath.remove()
              }
            } else {
              console.log(`${name} was not used`)
              objectPropertyPath.remove()
            }
          }
        })
      }
    }
  }
})