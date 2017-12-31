// TODO: createMemberExpressionCache contains a mutation
// caches all of the MemberExpression for comparison
// This is to prevent traversal of the entire program on each node visit
const createMemberExpressionCache = (cache = []) => ({
  updateCache: data => cache.push(data),
  getCache: () => cache
})

module.exports = createMemberExpressionCache
