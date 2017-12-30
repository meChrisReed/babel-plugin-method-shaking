// isMethod checks that an ObjectProperty holds a function
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
// This is to prevent traversal of the entire program on each node visit
const createMemberExpressionCache = (cache = []) => ({
  updateCache: data => cache.push(data),
  getCache: () => cache
})

// `isUsedMethod` checks that the ObjectProperty's function is used
// Currently it just looks in the cache
// (object containing method, method name, cache) -> Boolean
const isUsedMethod = ({
  obj,
  method,
  cache,
  pathToken,
  hasParentObjectProperty
}) =>
  hasParentObjectProperty
    ? cache.find(cached => cached.rawPathToken === pathToken)
    : cache.find(
        cached => cached.rawObject === obj && cached.rawMethod === method
      )

// functions are placed outside of the getObjectName truth table for performance and readability
const noObjectFound = path => "all options where undefined",
  calleeObjectFound = path => path.node.callee.object.name,
  calleeDeepObjectFound = path => path.node.callee.object.object.name

// `getObjectName` will find the object name based on the ast state
// TODO: this will need to be updated / replaced with path storage for path matching
// Currently there is a lot of room for inaccurate results
const getObjectName = path =>
  ({
    [true]: noObjectFound,

    [!!(
      path.node.callee.object && path.node.callee.object.name
    )]: calleeObjectFound,

    [!!(
      path.node.callee.object &&
      path.node.callee.object.object &&
      path.node.callee.object.object.name
    )]: calleeDeepObjectFound
  }[true](path))

const getObjectNamePathPropertyName = path =>
  ({
    [true]: noObjectFound,
    [!!(
      path.node.callee.object &&
      path.node.callee.object.property &&
      path.node.callee.object.property.name
    )]: path => path.node.callee.object.property.name
  }[true](path))

const generateLookUpToken = path => null

module.exports = ({ types: t }) => {
  const memberExpressionCache = createMemberExpressionCache()

  return {
    visitor: {
      Program: programPath => {
        programPath.traverse({
          CallExpression: callExpressionPath => {
            memberExpressionCache.updateCache({
              rawObject: getObjectName(callExpressionPath),
              rawMethod: callExpressionPath.node.callee.property.name,
              rawPathToken: `${getObjectName(
                callExpressionPath
              )}.${getObjectNamePathPropertyName(callExpressionPath)}.${
                callExpressionPath.node.callee.property.name
              }`
            })
          }
        })
      },
      ObjectProperty: objectPropertyPath => {
        const name = objectPropertyPath.node.key.name
        const parentObjectProperty = objectPropertyPath.findParent(
          parentPath => parentPath.type === "ObjectProperty"
        )
        const pathToken =
          parentObjectProperty && parentObjectProperty.node.key.name
        const parentObject = objectPropertyPath.findParent(
          parentPath => parentPath.type === "VariableDeclarator"
        )

        if (
          // TODO: isUsedMethod needs to be updated for path comparison
          // Currently there is a lot of room for inaccurate results
          isMethod(objectPropertyPath) &&
          !isUsedMethod({
            obj: parentObject.node.id.name,
            method: name,
            cache: memberExpressionCache.getCache(),
            pathToken: `${parentObject.node.id.name}.${pathToken}.${name}`,
            hasParentObjectProperty: parentObjectProperty
          })
        ) {
          objectPropertyPath.remove()
        }
      }
    }
  }
}
