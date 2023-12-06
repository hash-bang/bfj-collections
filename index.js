var bfj = require('bfj');
var fs = require('fs');

module.exports = function(stream, options) {
	var emitter = bfj.walk(stream, options);
	var settings = {
		pause: true,
		allowArrays: false,
		allowScalars: false,
		...(options || {}),
	};

	var stack = [];
	var stackTop = stack[0];
	var stackProp = [];

	var scalarSetter = val => { // This code is repeated for strings, numbers and literals
		if (stackProp.length) {
			var key = stackProp.pop();
			stackTop[key] = val;
		} else if (!stackTop) { // Pushing object out of bounds - assume top level scalar
			if (settings.allowScalars) {
				if (settings.pause) stream.pause();
				emitter.emit('bfjc', val);
				if (settings.pause && stream.isPaused()) stream.resume();
			}
		} else {
			stackTop.push(val);
		}
	};

	emitter
		.on(bfj.events.object, ()=> {
			if (stackProp.length) {
				var key = stackProp.pop();
				stackTop[key] = {};
				stack.push(stackTop[key]);
				stackTop = stack[stack.length-1];
			} else if (stack.length == 0) { // Root has to have a blank element inserted before it can be used
				stack.push({});
				stackTop = stack[stack.length-1];
			} else { // Every other collection (objects inside arrays) should have a maintained pointer
				stackTop.push({});
				stack.push(stackTop[stackTop.length-1]);
				stackTop = stack[stack.length-1];
			}
		})
		.on(bfj.events.endObject, ()=> {
			if (stack.length == 1) {
				if (settings.pause) stream.pause();
				emitter.emit('bfjc', stack[0]);
			}
			stack.pop();
			stackTop = stack[stack.length-1];
			if (settings.pause && stream.isPaused()) stream.resume();
		})
		.on(bfj.events.array, ()=> {
			if (stackProp.length) {
				var key = stackProp.pop();
				stackTop[key] = [];
				stack.push(stackTop[key]);
			} else if (!stackTop && settings.allowArrays) {
				stack.push([]);
			} else if (stack.length > 1 && Array.isArray(stackTop)) {
				var newArr = [];
				stackTop.push(newArr);
				stack.push(stackTop[stackTop.length-1]);
			}
			stackTop = stack[stack.length-1];
		})
		.on(bfj.events.endArray, ()=> {
			if (stack.length == 1) {
				emitter.emit('bfjc', [].concat(stack[0])); // Copy the array as we're about to wreck the stack pointer which upsets downstream references
				stack.pop();
				stackTop = undefined;
			} else {
				stack.pop();
				stackTop = stack[stack.length-1];
			}
		})
		.on(bfj.events.property, prop => {
			if (!stackTop) return; // Not in read mode
			stackProp.push(prop);
		})
		.on(bfj.events.string, scalarSetter)
		.on(bfj.events.number, scalarSetter)
		.on(bfj.events.literal, scalarSetter)

	return emitter;
};
