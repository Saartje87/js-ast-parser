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

	function parse ( expression ) {

		return (new Parser(expression)).parse()
	};

	it("should parse a string", function () {

		expect(parse("'  '")).toEqual({
			type : "String",
			value : "  "
		});

		expect(parse("'test'")).toEqual({
			type : "String",
			value : "test"
		});

		expect(parse("'test\\'n'")).toEqual({
			type : "String",
			value : "test'n"
		});

		expect(parse("'test\n\t'")).toEqual({
			type : "String",
			value : "test\n\t"
		});
	});

	it("should parse a number", function () {

		expect(parse("12")).toEqual({
			type : "Value",
			value : 12
		});

		expect(parse("12.24")).toEqual({
			type : "Value",
			value : 12.24
		});
	});

	it("should parse a identifier", function () {

		expect(parse("foo")).toEqual({
			type : "Identifier",
			value : "foo"
		});

		expect(parse("$foo")).toEqual({
			type : "Identifier",
			value : "$foo"
		});
	});

	it("should parse a object identifier", function () {

		expect(parse("foo.bar")).toEqual({
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

		expect(parse("foo[0]")).toEqual({
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

		expect(parse("foo[bar]")).toEqual({
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

		expect(parse("foo['bar']")).toEqual({
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

		expect(parse("foo.bar.baz")).toEqual({
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

		// console.log(JSON.stringify(parse("12 + 34"), null, "\t"))

		expect(parse("12 + 34")).toEqual({
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

		expect(parse("4 || 5")).toEqual({
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

		// console.log(JSON.stringify(parse("foo('bar', 2)"), null, "\t"))

		expect(parse("foo()")).toEqual({
		    type: 'Callable',
		    callable: {
		        type: 'Identifier',
		        value: 'foo'
		    }
		});

		expect(parse("foo.bar()")).toEqual({
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

		expect(parse("foo('bar', 2)")).toEqual({
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