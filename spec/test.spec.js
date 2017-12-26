import test from "ava"

import { transform } from "babel-core"
import { readFile } from "fs"

// store the log function
const log = console.log
// suppress logging
console.log = function() {}

// filePromise: Reads a file and returns a Promise.
// The Promise is resolved when the file is read and converted to a string.
// The Promise is rejected when a file fails to read
const filePromise = async path =>
  new Promise((resolve, reject) =>
    readFile(path, (err, data) => (err ? reject(err) : resolve(String(data))))
  )

// noPluginTransform: Use Babel to transform and get the code string back.
// To get the ast; Change the test to use `transform` without `.code`
const noPluginTransform = code => transform(code).code

// pluginTransform: the same as `noPluginTransform`, except that it uses the plugin
const pluginTransform = (code, logging = false) => {
  if (logging) {
    console.log = log
  }
  return transform(code, { plugins: ["./src/index.js"] }).code
}

test("Basic Test Reading Files", async t => {
  const sample = filePromise("spec/samples/make-testing-work.sample.js")

  const expected = filePromise("spec/samples/make-testing-work.expected.js")

  t.is(await sample, await expected)
})

test("basic-custom-plugin", async t => {
  const sample = filePromise("spec/samples/basic.sample.js")

  const expected = filePromise("spec/samples/basic.expected.js")

  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("multiple-used-identifiers", async t => {
  const sample = filePromise("spec/samples/multiple-used-methods.sample.js")

  const expected = filePromise("spec/samples/multiple-used-methods.expected.js")

  t.is(pluginTransform(await sample, true), noPluginTransform(await expected))
})
