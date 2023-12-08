var bfj = require('bfj');
var bfjc = require('..');
var chai = require('chai')
var spies = require('chai-spies');
chai.use(spies);
var expect = chai.expect;
var Readable = require('stream').Readable;

var str2stream = (str) => {
	var dataStream = new Readable();
	dataStream._read = ()=> {};
	dataStream.push(str);
	dataStream.push(null);
	return dataStream;
};

describe('bfjc(data)', function() {

	var data;
	before('should setup test data', ()=> {
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

	var results = [];
	it('should be able to read simple collections', done => {
		bfjc(str2stream(JSON.stringify(data)))
			.on('bfjc', node => results.push(node))
			.on(bfj.events.end, ()=> done())
	});

	it('should have a return of matching original input', ()=> {
		expect(results).to.deep.equal(data);
	});

	it('should emit end', done => {
		const spyEnd = chai.spy();
		bfjc(str2stream(JSON.stringify(data)))
			.on(bfj.events.end, () => {
				spyEnd();
				expect(spyEnd).to.have.been.called.once;
				done();
			});
	});

});


describe('bfjc(data) - use cases', function() {

	it('should parse data as per https://github.com/hash-bang/bfj-collections/issues/1', done => {
		var data = [{'foo': 'bar', 'foo2': [1,2,3], 'baz': [{'foo3':'bar2'}]}];
		var results = [];

		bfjc(str2stream(JSON.stringify(data)))
			.on('bfjc', node => results.push(node))
			.on(bfj.events.end, ()=> {
				expect(results).to.deep.equal(data);
				done();
			});
	});

	it('should parse nested arrays', done => {
		var data = [['Foo'], ['Bar'], ['Baz']];
		var results = [];
		bfjc(str2stream(JSON.stringify(data)), {allowArrays: true})
			.on('bfjc', node => results.push(node))
			.on(bfj.events.end, ()=> {
				expect(results).to.deep.equal(data);
				done();
			});
	});

	it('should cope with an array of strings', done => {
		var data = ['One', 'Two', 'Three', 'Four', 'Five'];
		var results = [];
		bfjc(str2stream(JSON.stringify(data)), {allowScalars: true})
			.on('bfjc', node => results.push(node))
			.on(bfj.events.end, ()=> {
				expect(results).to.deep.equal(data);
				done();
			});
	});

	it('should cope with nested empty structures as per https://github.com/hash-bang/bfj-collections/issues/2', done => {
		var data = [
			{foo: []},
			{bar: [{}]},
			{baz: [[]]},
			{quz: [{quz2: [{}, {}]}, {quz3: []}]},
			{flarp: [[], [{}]]},
		];
		var results = [];

		bfjc(str2stream(JSON.stringify(data), {allowArrays: true}))
			.on('bfjc', node => results.push(node))
			.on(bfj.events.end, ()=> {
				expect(results).to.deep.equal(data);
				done();
			});
	});

});
