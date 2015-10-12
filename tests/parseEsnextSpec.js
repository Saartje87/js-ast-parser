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

		expect(parse('foo(bar("baz"), 2)')).toEqual({
			type: 'Callable',
			callable: {
				type: 'Identifier',
				value: 'foo'
			},
			args: [
				{
					type: 'Callable',
					callable: {
						type: 'Identifier',
						value: 'bar'
					},
					args: [
						{
							type: 'String',
							value: 'baz'
						}
					]
				},
				{
					type: 'Number',
					value: 2
				}
			]
		});
	});

	it('should parse binary operators', function () {

		expect(parse('1 + 2')).toEqual({
			type: 'Binary',
			operator: '+',
			left: {
				type: 'Number',
				value: 1
			},
			right: {
				type: 'Number',
				value: 2
			}
		});

		expect(parse('24 - 12')).toEqual({
			type: 'Binary',
			operator: '-',
			left: {
				type: 'Number',
				value: 24
			},
			right: {
				type: 'Number',
				value: 12
			}
		});

		expect(parse('2 * 5 + 2 / 4')).toEqual({
			type: 'Binary',
			operator: '+',
			left: {
				type: 'Binary',
				operator: '*',
				left: {
					type: 'Number',
					value: 2
				},
				right: {
					type: 'Number',
					value: 5
				}
			},
			right: {
				type: 'Binary',
				operator: '/',
				left: {
					type: 'Number',
					value: 2
				},
				right: {
					type: 'Number',
					value: 4
				}
			}
		});
	});

	it('should parse assignment expressions', function () {

		expect(parse('foo = bar')).toEqual({
			type: 'Assignment',
			left: {
				type: 'Identifier',
				value: 'foo'
			},
			right: {
				type: 'Identifier',
				value: 'bar'
			}
		});

		expect(parse('foo = 1 + 3')).toEqual({
			type: 'Assignment',
			left: {
				type: 'Identifier',
				value: 'foo'
			},
			right: {
				type: 'Binary',
				operator: '+',
				left: {
					type: 'Number',
					value: 1
				},
				right: {
					type: 'Number',
					value: 3
				}
			}
		});
	});

	it('should parse nested expressions', function () {

		expect(parse('(a)')).toEqual({
			type: 'Nested',
			value: {
				type: 'Identifier',
				value: 'a'
			}
		});

		expect(parse('(a || b)')).toEqual({
			type: 'Nested',
			value: {
				type: 'Logical',
				operator: '||',
				left: {
					type: 'Identifier',
					value: 'a'
				},
				right: {
					type: 'Identifier',
					value: 'b'
				}
			}
		});
	});

	it('should parse unary expressions', function () {

		expect(parse('!foo')).toEqual({
			type: 'Unary',
			operator: '!',
			value: {
				type: 'Identifier',
				value: 'foo'
			}
		});

		expect(parse('++foo')).toEqual({
			type: 'Unary',
			operator: '++',
			value: {
				type: 'Identifier',
				value: 'foo'
			}
		});

		expect(parse('--foo')).toEqual({
			type: 'Unary',
			operator: '--',
			value: {
				type: 'Identifier',
				value: 'foo'
			}
		});
	});
});
