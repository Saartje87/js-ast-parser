describe('Parser', function () {

	function parse ( expression ) {

		return (new Parser(expression)).parse()
	};

	it("should parse a string", function () {

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

	// it("should parse a callable", function () {

	// 	expect(parse("foo()")).toEqual({
	// 		type : "Callable",
	// 		value : "foo()"
	// 	});
	// });
});