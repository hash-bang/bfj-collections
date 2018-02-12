bfj-collections
===============
A simple addon to the excellent [bfj](https://github.com/philbooth/bfj) module which provides a simple parser for very large JSON files in the form of collections.


**Assumptions:**

* Your JSON input is huge (otherwise you would just read it in via `JSON.parse`)
* Your data is in the form of a collection (i.e. an array of objects)
* You can hold each individual object in that collection in memory but not the whole input data


Why
---
While BFJ is excellent at working with very large JSON files sometimes you just want to be able to read all items in a collection without having to do the parsing yourself.


Example
-------
The below example demonstrates how to read in a very large JSON file and emits `bfjc` every time we can parse an object within the collection:

```javascript
bfjc(fs.createReadStream('someBigFile.json'))
	.on('bfjc', data => ... do something with the object entity ...)
	.on(bfj.events.end, ()=> ... we've finished reading ...)
```


API
===

bfjc(stream, [options])
-----------------------
The main exported function functions exactly the same as [bfj.walk](https://github.com/philbooth/bfj#bfjwalk-stream-options) and takes exactly the same input stream and options.
See that functions documentation for more details.
