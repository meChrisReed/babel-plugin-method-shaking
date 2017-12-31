const isMethod = require("./isMethod")

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
const getObjectName = ast => (ast.object ? getObjectName(ast.object) : ast.name)

const getObjectNamePathPropertyName = path =>
  ({
    [true]: noObjectFound,
    [!!(
      path.node.callee.object &&
      path.node.callee.object.property &&
      path.node.callee.object.property.name
    )]: path => path.node.callee.object.property.name
  }[true](path))

// callee -> lookupToken
const generateExpressionToken = (ast, token = []) =>
  ast.property
    ? generateExpressionToken(ast.object, [ast.property.name, ...token])
    : token.join(".")

const generatePropertyToken = (ast, token = []) => {
  const parent = ast.findParent(
    parentPath => parentPath.type === "ObjectProperty"
  )

  return parent && parent.node && parent.node.key && parent.node.key.name
    ? generatePropertyToken(parent, [parent.node.key.name, ...token])
    : token.join(".")
}

module.exports = ({ types: t }) => {
  const memberExpressionCache = createMemberExpressionCache()

  return {
    visitor: {
      Program: programPath => {
        programPath.traverse({
          CallExpression: callExpressionPath => {
            const objectName = getObjectName(callExpressionPath.node.callee)
            memberExpressionCache.updateCache({
              rawObject: objectName,
              rawMethod: callExpressionPath.node.callee.property.name,
              rawPathToken: `${objectName}.${generateExpressionToken(
                callExpressionPath.node.callee
              )}`
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
          isMethod(objectPropertyPath) &&
          !isUsedMethod({
            obj: parentObject.node.id.name,
            method: name,
            cache: memberExpressionCache.getCache(),
            pathToken: `${parentObject.node.id.name}.${parentObjectProperty &&
              generatePropertyToken(objectPropertyPath)}.${name}`,
            hasParentObjectProperty: parentObjectProperty
          })
        ) {
          objectPropertyPath.remove()
        }
      }
    }
  }
}
