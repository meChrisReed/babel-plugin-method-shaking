# Why have I made certain decisions?

## Why test in this way?

I chose not to use any babel specific tool for testing because:

* I did not want the testing pattern to be foreign
* Other developers can easily convert to whatever the next cool testing tool is
* Developers can use their knowledge of more popular tools to improve this pattern

The pattern I selected is

* Directly import `babel-core`
* Import a js sample file as a string
  * Files should be in the format `test-name.sample.js`
* Parse the string with `babel` using our plugin
* Compare that result to an expected file.
  * Files should be in the format `test-name.expected.js`
* The comparison will be made with a generic testing tool in this case AVA

I created the utils

```javascript
// filePromise: Reads a file and returns a Promise.
// The Promise is resolved when the file is read and converted to a string.
// The Promise is rejected when a file fails to read
const filePromise = async path =>
  new Promise((resolve, reject) =>
    readFile(path, (err, data) => (err ? reject(err) : resolve(String(data))))
  )
```

```javascript
// noPluginTransform: Use Babel to transform and get the code string back.
// To get the ast; Change the test to use `transform` without `.code`
const noPluginTransform = code => transform(code).code
```

```javascript
// pluginTransform: the same as `noPluginTransform`, except that it uses the plugin
const pluginTransform = code =>
  transform(code, { plugins: ["./src/index.js"] }).code
```

## Why does this plugin look so strange?

I am likely wrong about this, but Babel appears to expect visitor methods to return `undefined`. Babel appears to also want you to mutate the path. I have created a helper util that will allow us to return a new path object. The utility will then do the mutating and return undefined.

```javascript
const merge = require("deep-extend")

// super dumb mutation thing
// `deep-extend` which has been named `merge` will mutate the first object
const updatePath = (base, current) => merge(base, current) && undefined
```

This syntax opens up look up tables to meet conditions. It also is more like composition and an application of matrixes. Now when reading and writing a function I am not so concerned with what babel expects, and a control flow sequence. For refernece the original I copied from the babel-plugin-handbook:

```javascript
export default function({ types: t }) {
  return {
    visitor: {
      BinaryExpression(path) {
        if (path.node.operator !== "===") {
          return
        }

        path.node.left = t.identifier("sebmck")
        path.node.right = t.identifier("dork")
      }
    }
  }
}
```

Using the pattern in this repo:

```javascript
export default = ({ types: t }) => ({
  visitor: {
    BinaryExpression: ({ node, node: { left, right, operator } }) =>
      updatePath(node,  operator === "===" ? {
        left: t.identifier("hi"),
        right: t.identifier("boom")
      }: {left, right})
  }
})
```

which could be refactored if we needed to handle different outcomes.

```javascript
updatePath(node, {
  left: operator === "===" ? t.identifier("hi") : left,
  right: operator === "!==" ? t.identifier("boom") : right
})
```
