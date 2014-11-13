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
});