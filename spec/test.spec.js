import test from "ava"

import { transform } from "babel-core"
import { readFile } from "fs"

// store the log function
const log = console.log
// suppress logging
console.log = () =>
  log("`console.log` is suppressed try the global function `log` instead")

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
  const sample = filePromise("spec/fixtures/make-testing-work.sample.js")

  const expected = filePromise("spec/fixtures/make-testing-work.expected.js")

  t.is(await sample, await expected)
})

test("basic-custom-plugin", async t => {
  const sample = filePromise("spec/fixtures/basic.sample.js")

  const expected = filePromise("spec/fixtures/basic.expected.js")

  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("multiple-used-identifiers", async t => {
  const sample = filePromise("spec/fixtures/multiple-used-methods.sample.js")

  const expected = filePromise(
    "spec/fixtures/multiple-used-methods.expected.js"
  )

  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("deep-methods", async t => {
  const sample = filePromise("spec/fixtures/deep-methods.sample.js")

  const expected = filePromise("spec/fixtures/deep-methods.expected.js")

  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("deep-methods", async t => {
  const sample = filePromise("spec/fixtures/different-property-paths.sample.js")

  const expected = filePromise(
    "spec/fixtures/different-property-paths.expected.js"
  )

  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("deep-methods", async t => {
  const sample = filePromise(
    "spec/fixtures/deep-different-property-paths.sample.js"
  )

  const expected = filePromise(
    "spec/fixtures/deep-different-property-paths.expected.js"
  )
  // log(JSON.stringify(transform(await sample).ast))
  // t.fail()
  t.is(pluginTransform(await sample), noPluginTransform(await expected))
})

test("shorthand-methods", async t => {
  const sample = filePromise("spec/fixtures/shorthand-methods.sample.js")

  const expected = filePromise("spec/fixtures/shorthand-methods.expected.js")
  // log(JSON.stringify(transform(await sample).ast))
  // t.fail()
  t.is(pluginTransform(await sample, true), noPluginTransform(await expected))
})
