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

**Tech Debt**
Update the testing pattern.
I would like to write a package script that will:

* Prompt for the name of test(s) you would like to isolate
* Run all of the test except for the isolated ones; With logging from the source suppressed
* Run the isolated tests; with logging enabled

**Features**

* ~~Match original method name and original object identifier~~
* ~~Deep methods~~
* ~~Correctly match calls with the same method name, but different property paths. `a.used.call()` vs `a.unused.call`~~
* Correctly match deep different paths `a.b.c.call` vs `a.d.c.call`
* Clean out empty properties that have had all of their properties removed `obj = {used: {a: Function}, unused: {}}` the property `unused` can be removed
* All of the method creation patterns
* Follow inheritance chains
* Follow renaming paths
* High fives all around
