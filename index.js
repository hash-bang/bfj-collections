var bfj = require('bfj');
var fs = require('fs');

module.exports = function(stream, options) {
	var emitter =  bfj.walk(stream, options);

	var stack = [];
	var stackTop = stack[0];
	var stackProp = undefined;

	var scalarSetter = val => { // This code is repeated for strings, numbers and literals
		if (stackProp) {
			stackTop[stackProp] = val;
			stackProp = undefined;
		} else {
			stackTop.push(val);
		}
	};

	emitter
		.on(bfj.events.object, ()=> {
			if (stackProp) {
				stackTop[stackProp] = {};
				stack.push(stackTop[stackProp]);
				stackTop = stack[stack.length-1];
				stackProp = undefined;
			} else {
				stack.push({});
				stackTop = stack[stack.length-1];
			}
		})
		.on(bfj.events.endObject, ()=> {
			if (stack.length == 1) emitter.emit('bfjc', stack[0]);
			stack.pop();
			stackTop = stack[stack.length-1];
		})
		.on(bfj.events.array, ()=> {
			if (stackProp) {
				stackTop[stackProp] = [];
				stack.push(stackTop[stackProp]);
				stackTop = stack[stack.length-1];
				stackProp = undefined;
			} else {
				stackTop.push([]);
			}
		})
		.on(bfj.events.endArray, ()=> {
			stack.pop();
			stackTop = stack[stack.length-1];
		})
		.on(bfj.events.property, prop => {
			if (!stackTop) return; // Not in read mode
			stackProp = prop;
		})
		.on(bfj.events.string, scalarSetter)
		.on(bfj.events.number, scalarSetter)
		.on(bfj.events.literal, scalarSetter)

	return emitter;
};
