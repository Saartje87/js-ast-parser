// @todo handle parse errors
describe('ParseError', function () {

	it("should throw errors..", function () {

		expect(function () {

			Tokenize("' ");
		}).toThrow(Error("Unexpected string end"));

		expect(function () {

			Tokenize(" '");
		}).toThrow(Error("Unexpected string end"));

		expect(function () {

			Tokenize("a[0, 1]");
		}).toThrow(Error("Expected only 1 Identifier"));
	});
});