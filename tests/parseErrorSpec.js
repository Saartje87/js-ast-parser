// @todo handle parse errors
describe('ParseError', function () {

	it("should throw Strings", function () {

		expect(function () {

			Tokenize("' ");
		}).toThrow(Error("Unexpected string end"));

		expect(function () {

			Tokenize(" '");
		}).toThrow(Error("Unexpected string end"));
	});


	// it("should throw Strings", function () {

	// 	expect(Tokenize("a[0, 1]")).toThrow({
	// 		type : "String",
	// 		value : "  "
	// 	});
	// });
});