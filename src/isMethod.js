// NOTE: I tried `t.isObjectMethod` from `babel-types` it did not identify any of the methods with the `ObjectProperty` node type
// There is likely a better / more Babel way to do this

// isMethod checks that an ObjectProperty holds a function
// babel-types:Path -> Boolean
const isMethod = ({ node: { type, value } }) =>
  ({
    // default
    true: false,
    // covers `{ method: Function }`
    [value && value.type === "Identifier" && value.name === "Function"]: true,
    // covers `{ method: function name(params) { } }`
    [value && value.type === "FunctionExpression"]: true,
    // covers `{ method: () => {} }`
    [value && value.type === "ArrowFunctionExpression"]: true
  }.true)

module.exports = isMethod
