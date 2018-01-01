const isMethod = require("./isMethod")
const createMemberExpressionCache = require("./createMemberExpressionCache")
const isUsedMethod = require("./isUsedMethod")

// `getObjectName` will find the object name based on the ast state
// callee -> top parent object identifier
const getObjectName = ast => (ast.object ? getObjectName(ast.object) : ast.name)

// callee -> lookupToken
const generateExpressionToken = (ast, token = []) =>
  ast.property
    ? generateExpressionToken(ast.object, [ast.property.name, ...token])
    : token.join(".")

// babel-types:Path -> property path token excluding parent object identifier
const generatePropertyToken = (path, token = []) => {
  const parent = path.findParent(
    parentPath => parentPath.type === "ObjectProperty"
  )

  return parent && parent.node && parent.node.key && parent.node.key.name
    ? generatePropertyToken(parent, [parent.node.key.name, ...token])
    : token.join(".")
}

const handleObjectProperty = (path, memberExpressionCache, methodType) => {
  const name = path.node.key.name
  const parentObjectProperty = path.findParent(
    parentPath => parentPath.type === "ObjectProperty"
  )
  const pathToken = parentObjectProperty && parentObjectProperty.node.key.name
  const parentObject = path.findParent(
    parentPath => parentPath.type === "VariableDeclarator"
  )

  if (
    (methodType || isMethod(path)) &&
    !isUsedMethod({
      obj: parentObject.node.id.name,
      method: name,
      cache: memberExpressionCache.getCache(),
      pathToken: `${parentObject.node.id.name}.${parentObjectProperty &&
        generatePropertyToken(path)}.${name}`,
      hasParentObjectProperty: parentObjectProperty
    })
  ) {
    path.remove()
  }
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
      ObjectProperty: path => handleObjectProperty(path, memberExpressionCache),
      ObjectMethod: path =>
        handleObjectProperty(path, memberExpressionCache, true)
    }
  }
}
