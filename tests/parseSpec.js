describe('Parser', function () {

	it("should parse Strings", function () {

		expect(Tokenize("'  '")).toEqual({
			type : "String",
			value : "  "
		});

		expect(Tokenize("'test'")).toEqual({
			type : "String",
			value : "test"
		});

		expect(Tokenize("'test\\'n'")).toEqual({
			type : "String",
			value : "test'n"
		});

		expect(Tokenize("'test\n\t'")).toEqual({
			type : "String",
			value : "test\n\t"
		});
	});

	it("should parse Numbers", function () {

		expect(Tokenize("12")).toEqual({
			type : "Value",
			value : 12
		});

		expect(Tokenize("12.24")).toEqual({
			type : "Value",
			value : 12.24
		});
	});

	it("should parse Identifiers", function () {

		expect(Tokenize("foo")).toEqual({
			type : "Identifier",
			value : "foo"
		});

		expect(Tokenize("$foo")).toEqual({
			type : "Identifier",
			value : "$foo"
		});
	});

	it("should parse Literals", function () {

		expect(Tokenize("true")).toEqual({
			type : "Literal",
			value : "true"
		});

		expect(Tokenize("false")).toEqual({
			type : "Literal",
			value : "false"
		});

		expect(Tokenize("null")).toEqual({
			type : "Literal",
			value : "null"
		});
	});

	it("should parse object Identifiers", function () {

		expect(Tokenize("foo.bar")).toEqual({
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

		expect(Tokenize("foo[0]")).toEqual({
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

		expect(Tokenize("foo[bar]")).toEqual({
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

		expect(Tokenize("foo['bar']")).toEqual({
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

		expect(Tokenize("foo.bar.baz")).toEqual({
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

		// console.log(JSON.stringify(Tokenize("12 + 34"), null, "\t"))

		expect(Tokenize("12 + 34")).toEqual({
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

		expect(Tokenize("4 || 5")).toEqual({
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

	it("should parse larger expression", function () {

		expect(Tokenize("a || b || c")).toEqual({
			"type": "LogicalExpression",
			"operator": "||",
			"left": {
				"type": "LogicalExpression",
				"operator": "||",
				"left": {
					"type": "Identifier",
					"value": "a"
				},
				"right": {
					"type": "Identifier",
					"value": "b"
				}
			},
			"right": {
				"type": "Identifier",
				"value": "c"
			}
		});
	});

	it("should parse a callable", function () {

		// console.log(JSON.stringify(Tokenize("foo('bar', 2)"), null, "\t"))

		expect(Tokenize("foo()")).toEqual({
		    type: 'Callable',
		    callable: {
		        type: 'Identifier',
		        value: 'foo'
		    }
		});

		expect(Tokenize("foo.bar()")).toEqual({
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

		expect(Tokenize("foo('bar', 2)")).toEqual({
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

		expect(Tokenize("foo('bar' )")).toEqual({
			"type": "Callable",
			"callable": {
				"type": "Identifier",
				"value": "foo"
			},
			"args": [
				{
					"type": "String",
					"value": "bar"
				}
			]
		});

		expect(Tokenize("foo(a(), b())")).toEqual({
			"type": "Callable",
			"callable": {
				"type": "Identifier",
				"value": "foo"
			},
			"args": [
				{
					"type": "Callable",
					"callable": {
						"type": "Identifier",
						"value": "a"
					}
				},
				{
					"type": "Callable",
					"callable": {
						"type": "Identifier",
						"value": "b"
					}
				}
			]
		});

		expect(Tokenize("foo(a(a, 1, foo()), b()).then(a).always()")).toEqual({
			"type": "Object",
			"object": {
				"type": "Callable",
				"callable": {
					"type": "Identifier",
					"value": "foo"
				},
				"args": [
					{
						"type": "Callable",
						"callable": {
							"type": "Identifier",
							"value": "a"
						},
						"args": [
							{
								"type": "Identifier",
								"value": "a"
							},
							{
								"type": "Value",
								"value": 1
							},
							{
								"type": "Callable",
								"callable": {
									"type": "Identifier",
									"value": "foo"
								}
							}
						]
					},
					{
						"type": "Callable",
						"callable": {
							"type": "Identifier",
							"value": "b"
						}
					}
				]
			},
			"property": {
				"type": "Object",
				"object": {
					"type": "Callable",
					"callable": {
						"type": "Identifier",
						"value": "then"
					},
					"args": [
						{
							"type": "Identifier",
							"value": "a"
						}
					]
				},
				"property": {
					"type": "Callable",
					"callable": {
						"type": "Identifier",
						"value": "always"
					}
				}
			}
		});
	});

	it("should parse Arrays", function () {

		expect(Tokenize("[1, 2, 4]")).toEqual({
			"type": "Array",
			"property": [
				{
					"type": "Value",
					"value": 1
				},
				{
					"type": "Value",
					"value": 2
				},
				{
					"type": "Value",
					"value": 4
				}
			]
		});

		expect(Tokenize("[1, 2, 4, [8]]")).toEqual({
			"type": "Array",
			"property": [
				{
					"type": "Value",
					"value": 1
				},
				{
					"type": "Value",
					"value": 2
				},
				{
					"type": "Value",
					"value": 4
				},
				{
					"type": "Array",
					"property": [
						{
							"type": "Value",
							"value": 8
						}
					]
				}
			]
		});
	});

	it("should parse Groups", function () {

		expect(Tokenize("('foo')")).toEqual({
			"type": "Group",
			"value": {
				"type": "String",
				"value": "foo"
			}
		});

		expect(Tokenize("(foo())")).toEqual({
			"type": "Group",
			"value": {
				"type": "Callable",
				"callable": {
					"type": "Identifier",
					"value": "foo"
				}
			}
		});

		expect(Tokenize("(a) || (b)")).toEqual({
			"type": "LogicalExpression",
			"operator": "||",
			"left": {
				"type": "Group",
				"value": {
					"type": "Identifier",
					"value": "a"
				}
			},
			"right": {
				"type": "Group",
				"value": {
					"type": "Identifier",
					"value": "b"
				}
			}
		});

		expect(Tokenize("((a) || (b))")).toEqual({
			"type": "Group",
			"value": {
				"type": "LogicalExpression",
				"operator": "||",
				"left": {
					"type": "Group",
					"value": {
						"type": "Identifier",
						"value": "a"
					}
				},
				"right": {
					"type": "Group",
					"value": {
						"type": "Identifier",
						"value": "b"
					}
				}
			}
		});

		expect(Tokenize("(a + 2) * 10")).toEqual({
			"type": "BinaryExpression",
			"operator": "*",
			"left": {
				"type": "Group",
				"value": {
					"type": "BinaryExpression",
					"operator": "+",
					"left": {
						"type": "Identifier",
						"value": "a"
					},
					"right": {
						"type": "Value",
						"value": 2
					}
				}
			},
			"right": {
				"type": "Value",
				"value": 10
			}
		});
	});

	it("should parse Objects", function () {

		expect(Tokenize("{foo: 'bar'}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "String",
						"value": "bar"
					}
				}
			]
		});

		expect(Tokenize("{'foo': 'bar'}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "String",
						"value": "bar"
					}
				}
			]
		});

		expect(Tokenize("{'foo': bar()}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "Callable",
						"callable": {
							"type": "Identifier",
							"value": "bar"
						}
					}
				}
			]
		});

		expect(Tokenize("{foo: []}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "Array",
						"property": null
					}
				}
			]
		});

		expect(Tokenize("{foo: {bar: 'baz'}}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "Object",
						"properties": [
							{
								"type": "Property",
								"key": {
									"type": "Identifier",
									"value": "bar"
								},
								"value": {
									"type": "String",
									"value": "baz"
								}
							}
						]
					}
				}
			]
		});
	});

	it("should parse ConditionalExpressions", function () {

		expect(Tokenize("true ? 'yes' : 'no'")).toEqual({
			"type": "ConditionalExpression",
			"test": {
				"type": "Literal",
				"value": "true"
			},
			"consequent": {
				"type": "String",
				"value": "yes"
			},
			"alternate": {
				"type": "String",
				"value": "no"
			}
		});

		expect(Tokenize("true || foo ? 'yes' : 'no'")).toEqual({
			"type": "ConditionalExpression",
			"test": {
				"type": "LogicalExpression",
				"operator": "||",
				"left": {
					"type": "Literal",
					"value": "true"
				},
				"right": {
					"type": "Identifier",
					"value": "foo"
				}
			},
			"consequent": {
				"type": "String",
				"value": "yes"
			},
			"alternate": {
				"type": "String",
				"value": "no"
			}
		});

		expect(Tokenize("(true || foo) ? 'yes' : 'no'")).toEqual({
			"type": "ConditionalExpression",
			"test": {
				"type": "Group",
				"value": {
					"type": "LogicalExpression",
					"operator": "||",
					"left": {
						"type": "Literal",
						"value": "true"
					},
					"right": {
						"type": "Identifier",
						"value": "foo"
					}
				}
			},
			"consequent": {
				"type": "String",
				"value": "yes"
			},
			"alternate": {
				"type": "String",
				"value": "no"
			}
		});

		expect(Tokenize("{foo: true ? 'yes' : 'no'}")).toEqual({
			"type": "Object",
			"properties": [
				{
					"type": "Property",
					"key": {
						"type": "Identifier",
						"value": "foo"
					},
					"value": {
						"type": "ConditionalExpression",
						"test": {
							"type": "Literal",
							"value": "true"
						},
						"consequent": {
							"type": "String",
							"value": "yes"
						},
						"alternate": {
							"type": "String",
							"value": "no"
						}
					}
				}
			]
		});
	});

	it("should parse Unary Expression", function () {

		expect(Tokenize("!foo")).toEqual({
			"type": "UnaryExpression",
			"operator": "!",
			"value": {
				"type": "Identifier",
				"value": "foo"
			}
		});

		expect(Tokenize("!!foo")).toEqual({
			"type": "UnaryExpression",
			"operator": "!",
			"value": {
				"type": "UnaryExpression",
				"operator": "!",
				"value": {
					"type": "Identifier",
					"value": "foo"
				}
			}
		});

		expect(Tokenize("-foo")).toEqual({
			"type": "UnaryExpression",
			"operator": "-",
			"value": {
				"type": "Identifier",
				"value": "foo"
			}
		});

		expect(Tokenize("--foo")).toEqual({
			"type": "UnaryExpression",
			"operator": "--",
			"value": {
				"type": "Identifier",
				"value": "foo"
			}
		});
	});
});