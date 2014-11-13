describe('Parser', function () {

	it("should parse a string", function () {

		expect((new Parser("'test'")).parse()).toEqual({
			type : "String",
			value : "test"
		});

		// expect(parse("'test\'n'")).toEqual({
		// 	type : "String",
		// 	value : "test'n"
		// });

		// expect(parse("'test\n'")).toEqual({
		// 	type : "String",
		// 	value : "test'n"
		// });
	});
});