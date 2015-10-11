describe('Parser', function () {

	var parse = Rocky.parse;

	it('should parse numbers', function () {

		expect(parse('1')).toEqual({
			type: 'Number',
			value: 1
		});

		expect(parse('1.234')).toEqual({
			type: 'Number',
			value: 1.234
		});

		expect(parse('1e3')).toEqual({
			type: 'Number',
			value: 1000 // or 1e3..
		});
	});

	it('should parse strings', function () {

		expect(parse('"foo"')).toEqual({
			type: 'String',
			value: 'foo'
		});

		expect(parse('"foo bar"')).toEqual({
			type: 'String',
			value: 'foo bar'
		});

		expect(parse('"foo \\"bar\\""')).toEqual({
			type: 'String',
			value: 'foo "bar"'
		});

		expect(parse("'foo'")).toEqual({
			type: 'String',
			value: 'foo'
		});

		expect(parse("'foo bar'")).toEqual({
			type: 'String',
			value: 'foo bar'
		});

		expect(parse("'foo \\'bar\\''")).toEqual({
			type: 'String',
			value: "foo 'bar'"
		});

		expect(parse("'foo \"bar\\'s\"'")).toEqual({
			type: 'String',
			value: 'foo "bar\'s"'
		});

		expect(parse('"foo\n\t"')).toEqual({
			type: 'String',
			value: 'foo\n\t'
		});
	});

	it('should parse literals', function () {

		expect(parse('true')).toEqual({
			type: 'Literal',
			value: true
		});

		expect(parse('false')).toEqual({
			type: 'Literal',
			value: false
		});

		expect(parse('null')).toEqual({
			type: 'Literal',
			value: null
		});
	});

	it('should parse callables', function () {

		expect(parse('foo()')).toEqual({
			type: 'Callable',
			callable: {
				type: 'Identifier',
				value: 'foo'
			},
			args: []
		});

		expect(parse('foo(1, "2")')).toEqual({
			type: 'Callable',
			callable: {
				type: 'Identifier',
				value: 'foo'
			},
			args: [
				{
					type: 'Number',
					value: 1
				},
				{
					type: 'String',
					value: '2'
				}
			]
		});
	});
});
