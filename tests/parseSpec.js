// @todos
// a || b || 'thiees'
// (a * 2) + 10
// funcA() || funcB()
// [1, 2]
// {foo: 'bar'}
// !!foo
// ('foo')
// [['foo'], [2]]
// true ? 'yes' : 'no'


describe('Parser', function () {

	it("should parse a string", function () {

		expect(Tokenize("'  '")).toEqual({
			type : "String",
			value : "  "
		});

		expect(Tokenize("'test'")).toEqual({
			type : "String",
			value : "test"
		});

		expect(Tokenize("'test\\'n'")).toEqual({
			type : "String",
			value : "test'n"
		});

		expect(Tokenize("'test\n\t'")).toEqual({
			type : "String",
			value : "test\n\t"
		});
	});

	it("should parse a number", function () {

		expect(Tokenize("12")).toEqual({
			type : "Value",
			value : 12
		});

		expect(Tokenize("12.24")).toEqual({
			type : "Value",
			value : 12.24
		});
	});

	it("should parse a identifier", function () {

		expect(Tokenize("foo")).toEqual({
			type : "Identifier",
			value : "foo"
		});

		expect(Tokenize("$foo")).toEqual({
			type : "Identifier",
			value : "$foo"
		});
	});

	it("should parse a object identifier", function () {

		expect(Tokenize("foo.bar")).toEqual({
			type : "Object",
			object : {

				type: "Identifier",
				value: "foo"
			},
			property: {

				type: "Identifier",
				value: "bar"
			}
		});

		expect(Tokenize("foo[0]")).toEqual({
		    type: 'Object',
		    object: {
		        type: 'Identifier',
		        value: 'foo'
		    },
		    property: {
		        type: 'Value',
		        value: 0
		    }
		});

		expect(Tokenize("foo[bar]")).toEqual({
		    type: 'Object',
		    object: {
		        type: 'Identifier',
		        value: 'foo'
		    },
		    property: {
		        type: 'Identifier',
		        value: 'bar'
		    }
		});

		expect(Tokenize("foo['bar']")).toEqual({
		    type: 'Object',
		    object: {
		        type: 'Identifier',
		        value: 'foo'
		    },
		    property: {
		        type: 'String',
		        value: 'bar'
		    }
		});

		expect(Tokenize("foo.bar.baz")).toEqual({
			type: 'Object',
			object: {
			    type: 'Identifier',
			    value: 'foo'
			},
			property: {
			    type: 'Object',
			    object: {
			        type: 'Identifier',
			        value: 'bar'
			    },
			    property: {
			        type: 'Identifier',
			        value: 'baz'
			    }
			}
		});
	});

	it("should parse simple expression", function () {

		// console.log(JSON.stringify(Tokenize("12 + 34"), null, "\t"))

		expect(Tokenize("12 + 34")).toEqual({
			"type": "BinaryExpression",
			"operator": "+",
			"left": {
				"type": "Value",
				"value": 12
			},
			"right": {
				"type": "Value",
				"value": 34
			}
		});

		expect(Tokenize("4 || 5")).toEqual({
			"type": "LogicalExpression",
			"operator": "||",
			"left": {
				"type": "Value",
				"value": 4
			},
			"right": {
				"type": "Value",
				"value": 5
			}
		});
	});

	it("should parse a callable", function () {

		// console.log(JSON.stringify(Tokenize("foo('bar', 2)"), null, "\t"))

		expect(Tokenize("foo()")).toEqual({
		    type: 'Callable',
		    callable: {
		        type: 'Identifier',
		        value: 'foo'
		    }
		});

		expect(Tokenize("foo.bar()")).toEqual({
			"type": "Object",
			"object": {
				"type": "Identifier",
				"value": "foo"
			},
			"property": {
				"type": "Callable",
				"callable": {
					"type": "Identifier",
					"value": "bar"
				}
			}
		});

		expect(Tokenize("foo('bar', 2)")).toEqual({
			"type": "Callable",
			"callable": {
				"type": "Identifier",
				"value": "foo"
			},
			"args": [
				{
					"type": "String",
					"value": "bar"
				},
				{
					"type": "Value",
					"value": 2
				}
			]
		});
	});
});