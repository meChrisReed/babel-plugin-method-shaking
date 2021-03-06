# This is a Work In Progress

My first babel plugin :)

## Development

Moving fast and loose. I am sure there are some better solutions like:

* Testing pattern
* Logging and development iteration
* Selection of used method names
* There is mutation

The pattern I have been using to iterate changes:

* Create fixtures `spec/samples/what-it-do.sample.js` and `spec/samples/what-it-do.expected.js`
* Write a unit test
* Make sure to pass the `logging` param into `pluginTransform(await file, true)`
* Run `yarn test`. Use `nodemon` if you want to watch

## TODO:

### Tech Debt

* Update the testing pattern. I would like to write a package script that will:
  * Prompt for the name of test(s) you would like to isolate
  * Run all of the test except for the isolated ones; With logging from the source suppressed
  * Run the isolated tests; with logging enabled
* Update `isMethod` to avoid configuration, by making the recursion work on shallow forms as well
* ~~Break functions out into util files~~
* Use babel to build this package before testing. To take advantage of modern language features

### Features

* All of the method creation patterns
  * assigned: `function() {this.primitive = Function; this.fat = () => null; this.fun = function() {}}`
  * class method: `class plop {fun() {}}`
  * computed name: `{[name](param){return null}}`
  * generators: `function* () {}`
  * short hand generators: `*name(){}`
  * new:
    ```javascript
    const numA = "numA",
      numB = "numB"
    const sum = new Function(numA, numB, "return numA + numB")
    sum(1, 1) // => 2
    ```
* Clean out empty properties that have had all of their properties removed `obj = {used: {a: Function}, unused: {}}` the property `unused` can be removed
* Follow inheritance chains
* Follow renaming paths
* Follow assignment of identifiers
  * `const fn = () => null; this.method = fn`
  * `function fn () {}; this.method = fn`
  * `function fn () {}; const obj = {fun: fn}`
* High fives all around

## Done

* Match original method name and original object identifier
  ```javascript
  const obj = {
    primitive: Function,
    fat: () => null,
    fun: function() {}
  }
  ```
  * Deep methods
  ```javascript
  const obj = {
    used: { call: Function },
    unused: { call: FUnction }
  }
  ```
  * Correctly match calls with the same method name, but different property paths. `a.used.call()` vs `a.unused.call`
  * Correctly match deep different paths `a.b.c.call` vs `a.d.c.call`
  * All of the method creation patterns
  * as properties:
  ```javascript
  const obj = {
    primitive: Function,
    fat: () => null,
    fun: function() {}
  }
  ```
  * shorthand: `{fun(){}}`
