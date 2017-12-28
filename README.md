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

**Features**

* ~~Match original method name and original object identifier~~
* ~~Deep methods~~
* Correctly match calls with the same method name, but different property paths. `a.b.call()` vs `a.c.call()`
* All of the method creation patterns
* Follow inheritance chains
* Follow renaming paths
* High fives all around
