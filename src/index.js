const merge = require("deep-extend")

// super dumb mutation thing
// `deep-extend` which has been named `merge` will mutate the first object
const updatePath = (base, current) => merge(base, current) && undefined

module.exports = ({ types: t }) => ({
  visitor: {
    BinaryExpression: ({ node, node: { left, right, operator } }) =>
      updatePath(
        node,
        operator === "==="
          ? {
              left: t.identifier("hi"),
              right: t.identifier("boom")
            }
          : { left, right }
      )
  }
})
