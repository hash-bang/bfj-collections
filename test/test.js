var bfj = require('bfj');
var bfjc = require('..');
var expect = require('chai').expect;
var Readable = require('stream').Readable;

describe('bfjc(data)', function() {

	var data;
	before('it should setup test data', ()=> {
		data = [
			{
				foo: 'Foo1!',
				bar: 'Bar1!',
				baz: 1,
				quz: true,
				florp: false,
			},
			{
				foo: 'Foo2!',
				bar: 'Bar2!',
				baz: 12,
				quz: true,
				florp: false,
				clorp: {
					fooNested: 'FooNested!',
					barNested: 123,
					bazNested: true,
					quzNested: [1, 3, 3],
				},
			},
			{
				foo: 'Foo3!',
				bar: 'Bar3!',
				baz: 123,
				quz: false,
				florp: true,
			},
		];
	});

	var dataStr;
	before('it should convert test data to a string', ()=> {
		dataStr = JSON.stringify(data);
	});

	var dataStream;
	before('it should convert the string into a stream', ()=> {
		dataStream = new Readable();
		dataStream._read = ()=> {};
		dataStream.push(dataStr);
		dataStream.push(null);
	});

	var result = [];
	it('should be able to read simple collections', done => {
		bfjc(dataStream)
			.on('bfjc', data => result.push(data))
			.on(bfj.events.end, ()=> done())
	});

	it('should have a return of approximately matching original input', ()=> {
		expect(result).to.deep.equal(data);
	});

});
