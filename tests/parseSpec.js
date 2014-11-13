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
});