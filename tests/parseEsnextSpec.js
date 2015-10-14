// TODO Identifier should have name attribute?
// TODO Function chaining

describe('Parser', function () {

	var parse = Rocky.parse;

	it('should parse numbers', function () {

		expect(parse('1')).toEqual({
			type: 'Number',
			value: 1,
			raw: '1'
		});

		expect(parse('1.234')).toEqual({
			type: 'Number',
			value: 1.234,
			raw: '1.234'
		});

		expect(parse('1e3')).toEqual({
			type: 'Number',
			value: 1000,
			raw: '1e3'
		});
	});

	it('should parse strings', function () {

		expect(parse('"foo"')).toEqual({
			type: 'String',
			value: 'foo',
			raw: '"foo"'
		});

		expect(parse('"foo bar"')).toEqual({
			type: 'String',
			value: 'foo bar',
			raw: '"foo bar"'
		});

		expect(parse('"foo \\"bar\\""')).toEqual({
			type: 'String',
			value: 'foo "bar"',
			raw: '"foo \\"bar\\""'
		});

		expect(parse("'foo'")).toEqual({
			type: 'String',
			value: 'foo',
			raw: "'foo'"
		});

		expect(parse("'foo bar'")).toEqual({
			type: 'String',
			value: 'foo bar',
			raw: "'foo bar'"
		});

		expect(parse("'foo \\'bar\\''")).toEqual({
			type: 'String',
			value: "foo 'bar'",
			raw: "'foo \\'bar\\''"
		});

		expect(parse("'foo \"bar\\'s\"'")).toEqual({
			type: 'String',
			value: 'foo "bar\'s"',
			raw: "'foo \"bar\\'s\"'"
		});

		expect(parse('"foo\n\t"')).toEqual({
			type: 'String',
			value: 'foo\n\t',
			raw: '"foo\n\t"'
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
					value: 1,
					raw: '1'
				},
				{
					type: 'String',
					value: '2',
					raw: '"2"'
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
							value: 'baz',
							raw: '"baz"'
						}
					]
				},
				{
					type: 'Number',
					value: 2,
					raw: '2'
				}
			]
		});

		expect(parse('foo(2 + 2)')).toEqual({
			type: 'Callable',
			callable: {
				type: 'Identifier',
				value: 'foo'
			},
			args: [
				{
					type: 'Binary',
					operator: '+',
					left: {
						type: 'Number',
						value: 2,
						raw: '2'
					},
					right: {
						type: 'Number',
						value: 2,
						raw: '2'
					}
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
				value: 1,
				raw: '1'
			},
			right: {
				type: 'Number',
				value: 2,
				raw: '2'
			}
		});

		expect(parse('24 - 12')).toEqual({
			type: 'Binary',
			operator: '-',
			left: {
				type: 'Number',
				value: 24,
				raw: '24'
			},
			right: {
				type: 'Number',
				value: 12,
				raw: '12'
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
					value: 2,
					raw: '2'
				},
				right: {
					type: 'Number',
					value: 5,
					raw: '5'
				}
			},
			right: {
				type: 'Binary',
				operator: '/',
				left: {
					type: 'Number',
					value: 2,
					raw: '2'
				},
				right: {
					type: 'Number',
					value: 4,
					raw: '4'
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
					value: 1,
					raw: '1'
				},
				right: {
					type: 'Number',
					value: 3,
					raw: '3'
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

	it('should parse member expressions', function () {

		expect(parse('foo.bar')).toEqual({
			type: 'Member',
			computed: false,
			object: {
				type: 'Identifier',
				value: 'foo'
			},
			property: {
				type: 'Identifier',
				value: 'bar'
			}
		});

		expect(parse('foo.bar.baz')).toEqual({
			type: 'Member',
			computed: false,
			object: {
				type: 'Identifier',
				value: 'foo'
			},
			property: {
				type: 'Member',
				computed: false,
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

		expect(parse('foo[0]')).toEqual({
			type: 'Member',
			computed: true,
			object: {
				type: 'Identifier',
				value: 'foo'
			},
			property: {
				type: 'Number',
				value: 0,
				raw: '0'
			}
		});

		expect(parse('foo[bar()]')).toEqual({
			type: 'Member',
			computed: true,
			object: {
				type: 'Identifier',
				value: 'foo'
			},
			property: {
				type: 'Callable',
				callable: {
					type: 'Identifier',
					value: 'bar'
				},
				args: []
			}
		});
	});

	it('should parse Logical expressions', function () {

		expect(parse('foo.bar || bar.foo')).toEqual({
			type: 'Logical',
			operator: '||',
			left: {
				type: "Member",
				computed: false,
				object: {
					type: "Identifier",
					value: "foo"
				},
				property: {
					type: "Identifier",
					value: "bar"
				}
			},
			right: {
				type: "Member",
				computed: false,
				object: {
					type: "Identifier",
					value: "bar"
				},
				property: {
					type: "Identifier",
					value: "foo"
				}
			}
		});
	});

	it('should parse objects', function () {

		expect(parse('{foo: "bar"}')).toEqual({
			type: "Object",
			properties: [
				{
					type: "Property",
					key: {
						type: "Identifier",
						value: "foo"
					},
					value: {
						type: "String",
						value: "bar",
						raw: "\"bar\""
					}
				}
			]
		});

		expect(parse('{foo: "bar", bar: 2 + 2}')).toEqual({
			type: "Object",
			properties: [
				{
					type: "Property",
					key: {
						type: "Identifier",
						value: "foo"
					},
					value: {
						type: "String",
						value: "bar",
						raw: "\"bar\""
					}
				},
				{
					type: "Property",
					key: {
						type: "Identifier",
						value: "bar"
					},
					value: {
						type: "Binary",
						operator: "+",
						left: {
							type: "Number",
							value: 2,
							raw: "2"
						},
						right: {
							type: "Number",
							value: 2,
							raw: "2"
						}
					}
				}
			]
		});
	});

	it('should parse arrays', function () {

		expect(parse('[1]')).toEqual({
			type: "Array",
			properties: [
				{
					type: "Number",
					value: 1,
					raw: "1"
				}
			]
		});

		expect(parse('[1, foo()]')).toEqual({
			type: "Array",
			properties: [
				{
					type: "Number",
					value: 1,
					raw: "1"
				},
				{
					type: "Callable",
					callable: {
						type: "Identifier",
						value: "foo"
					},
					args: []
				}
			]
		});

		expect(parse('[a, 1 + 2]')).toEqual({
			type: "Array",
			properties: [
				{
					type: "Identifier",
					value: "a"
				},
				{
					type: "Binary",
					operator: "+",
					left: {
						type: "Number",
						value: 1,
						raw: "1"
					},
					right: {
						type: "Number",
						value: 2,
						raw: "2"
					}
				}
			]
		});
	});
});
