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

module.exports = isUsedMethod
