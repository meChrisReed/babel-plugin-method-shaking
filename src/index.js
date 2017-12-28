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

// `getObjectName` will find the object name based on the ast state
// TODO: this will need to be updated / replaced with path storage for path matching
// Currently there is a lot of room for inaccurate results
const getObjectName = path =>
  ({
    [true]: () => "all options where undefined",

    [!!(path.node.callee.object && path.node.callee.object.name)]: () =>
      path.node.callee.object.name,

    [!!(
      path.node.callee.object &&
      path.node.callee.object.object &&
      path.node.callee.object.object.name
    )]: () => path.node.callee.object.object.name
  }[true]())

module.exports = ({ types: t }) => {
  const memberExpressionCache = createMemberExpressionCache()

  return {
    visitor: {
      Program: programPath => {
        programPath.traverse({
          CallExpression: callExpressionPath => {
            memberExpressionCache.updateCache({
              rawObject: getObjectName(callExpressionPath),
              rawMethod: callExpressionPath.node.callee.property.name
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
          // TODO: isUsedMethod needs to be updated for path comparison
          // Currently there is a lot of room for inaccurate results
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
