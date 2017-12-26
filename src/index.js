// isMethod checks that this ObjectProperty holds a function
// I tried `t.isObjectMethod` from `babel-types` it did not identify any of the methods with the `ObjectProperty` node type
// There is likely a better / more Babel way to do this
// Path -> Boolean
const isMethod = ({ node: { type, value } }) =>
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

// TODO: createMemberExpressionCache contains a mutation
// caches all of the MemberExpression for comparison
const createMemberExpressionCache = (cache = []) => ({
  updateCache: data => cache.push(data),
  getCache: () => cache
})

// (object containing method, method name, cache) -> Boolean
const isUsedMethod = (obj, method, cache) =>
  cache.find(cached => cached.rawObject === obj && cached.rawMethod === method)

module.exports = ({ types: t }) => {
  const memberExpressionCache = createMemberExpressionCache()

  return {
    visitor: {
      Program: programPath => {
        programPath.traverse({
          MemberExpression: memberExpressionPath => {
            memberExpressionCache.updateCache({
              rawObject: memberExpressionPath.node.object.name,
              rawMethod: memberExpressionPath.node.property.name
            })
          }
        })
      },
      ObjectProperty: objectPropertyPath => {
        const name = objectPropertyPath.node.key.name
        const parentObject = objectPropertyPath.findParent(
          parentPath => parentPath.type === "VariableDeclarator"
        )

        if (
          isMethod(objectPropertyPath) &&
          !isUsedMethod(
            parentObject.node.id.name,
            name,
            memberExpressionCache.getCache()
          )
        ) {
          objectPropertyPath.remove()
        }
      }
    }
  }
}
