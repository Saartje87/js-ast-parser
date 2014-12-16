/**
 * Wrapper function that tokenize input
 *
 * @return {Tree}
 */
function Tokenize ( expression ) {

	return (new Parser(expression)).parse();
}

function Parser ( expression ) {

	expression = String(expression).trim();

	this.text = expression;
	this.length = expression.length;
	// 
	this.index = -1;
	// Current character being parsed
	this.chr = null;
};

Parser.prototype = {

	// Shoud be a weakmap (? prototype-less object)
	binaryOperators: {

		'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
		'==': 6, '!=': 6, '===': 6, '!==': 6,
		'<': 7,  '>': 7,  '<=': 7,  '>=': 7, 
		'<<':8,  '>>': 8, '>>>': 8,
		'+': 9, '-': 9,
		'*': 10, '/': 10, '%': 10
	},

	literals: {

		'true': true,
		'false': true,
		'null': true
	},

	/**
	 *
	 */
	parse: function () {

		this.read();

		// Unexpcted end when this.index !== this.length

		return this.parseExpression();
	},

	/**
	 *
	 */
	parseExpression: function () {

		var left = this.parseToken(),
			operator = this.parseOperator(),
			right,
			node,
			stack,
			i;

		if( !operator ) {

			if( this.chr === '?' ) {

				return this.parseConditionalExpression(left);
			}

			return left;
		}

		right = this.parseToken();

		if( !right ) {

			throw Error("Expected expression after operator"+this.chr)
		}

		stack = [left, operator, right];

		while( (operator = this.parseOperator()) ) {

			while( (stack.length > 2) && (operator.precedence <= stack[stack.length - 2].precedence) ) {

				right = stack.pop();
				operator = stack.pop();
				left = stack.pop();

				node = this.createBinaryExpression(operator.value, left, right);

				stack.push(node);
			}

			node = this.parseToken();

			if( !node ) {

				throw Error("Expected expression after operator")
			}

			stack.push(operator, node);
		}

		i = stack.length - 1;
		node = stack[i];

		while( i > 1 ) {

			node = this.createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
			i -= 2;
		}

		if( this.chr === '?' ) {

			return this.parseConditionalExpression(node);
		}

		return node;
	},

	/**
	 *
	 */
	createBinaryExpression: function ( operator, left, right ) {

		var type = (operator === '||' || operator === '&&') ? 'LogicalExpression' : 'BinaryExpression';
		
		return {
			type: type,
			operator: operator,
			left: left,
			right: right
		};
	},

	/**
	 *
	 */
	parseToken: function () {

		if( this.is('+-!') ) {

			return this.parseUnaryExpression();
		}

		if( this.is('0123456789') ) {

			return this.parseNumber();
		}

		if( this.is('"\'') ) {

			return this.parseString();
		}

		if( this.is('(') ) {

			return this.parseGroup();
		}

		if( this.is('{') ) {

			return this.parseObject();
		}

		return this.parseVariable();
	},

	/**
	 *
	 */
	parseOperator: function () {

		var chr = this.chr,
			two = this.chr+this.peek(),
			three = two+this.peek(2),
			match,
			binaryOperators = this.binaryOperators,
			i = 0, j = 0;

		if( !this.chr ) {

			return null;
		}

		if( binaryOperators.hasOwnProperty(three) ) {

			match = three;
			this.skip(3);
		} else if( binaryOperators.hasOwnProperty(two) ) {

			match = two;
			this.skip(2);
		} else if( binaryOperators.hasOwnProperty(chr) ) {

			match = chr;
			this.skip(1);
		}

		this.read(true);

		if( !match ) {

			return null;
		}

		return {

			value: match,
			precedence: this.binaryOperators[match]
		};
	},

	/**
	 * Read next char
	 *
	 * @return {Boolean}
	 */
	read: function ( skipWhitespaceOnly ) {

		if( skipWhitespaceOnly && this.chr !== ' ' ) {

			return true;
		}

		this.index += 1;

		if( this.index > this.length ) {

			return false;
		}

		this.chr = this.text[this.index];

		return true;
	},

	/**
	 *
	 */
	peek: function ( i ) {

		return this.text[this.index + (i || 1)] || '';
	},

	/**
	 *
	 */
	skip: function ( i ) {

		this.index += i - 1;

		return this.read();
	},

	/**
	 * @return {Boolean}
	 */
	is: function ( chars ) {

		return chars.indexOf(this.chr) !== -1;
	},

	/**
	 * Tokenize string
	 */
	parseString: function () {

		var value = '',
			qoute = this.chr;

		while ( this.read() ) {

			if( this.chr === '\\' ) {

				this.read();

				// Escaped qoute
				if( this.chr === qoute ) {
						
					value += qoute;
					continue;
				}

				// \b \n \t \a\ r
				if( this.is('bntar') ) {

					value += '\\'+this.chr;
					continue;
				}
			}

			// End of string
			if( this.chr === qoute ) {

				break;
			}

			if( this.chr === void 0 ) {

				throw Error('Unexpected string end');
			}

			value += this.chr;
		}

		// Skip qoute
		this.read();
		this.read(true);

		return {

			type: "String",
			value: value
		};
	},

	/**
	 *
	 */
	parseNumber: function () {

		var value = this.chr;

		while ( this.read() ) {

			if( !this.is('0123456789.') ) {

				break;
			}

			value += this.chr;
		}

		this.read(true);

		return {

			type: "Value",
			value: parseFloat(value) || 0
		};
	},

	/**
	 *
	 */
	isIdentifierStart: function () {

		var chrCode = this.text.charCodeAt(this.index);

		return (chrCode === 36) || (chrCode === 95) || // `$` and `_`
			(chrCode >= 65 && chrCode <= 90) || // A...Z
			(chrCode >= 97 && chrCode <= 122); // a...z
	},

	/**
	 *
	 */
	isIdentifierPart: function () {

		var chrCode = this.text.charCodeAt(this.index);

		return (chrCode === 36) || (chrCode === 95) || // `$` and `_`
			(chrCode >= 65 && chrCode <= 90) || // A...Z
			(chrCode >= 97 && chrCode <= 122) || // a...z
			(chrCode >= 48 && chrCode <= 57); // 0...9
	},

	/**
	 * may start with [$_A-Za-z]
	 * mat contain [$_A-Za-z0-9]
	 */
	parseIdentifier: function () {

		var chrCode = this.text.charCodeAt(this.index),
			value = this.chr;

		while( this.read() ) {

			if( !this.isIdentifierPart() ) {

				break;
			}

			value += this.chr;
		}

		this.read(true);

		return {

			type: this.literals.hasOwnProperty(value) ? 'Literal' : 'Identifier',
			value: value
		};
	},

	/**
	 *
	 */
	parseVariable: function () {

		var node,
			chr,
			args;

		if( this.isIdentifierStart() ) {

			node = this.parseIdentifier();
		}

		while( this.chr && this.is('.[(') ) {

			chr = this.chr;

			this.read();

			if( chr === '.' ) {

				node = {

					type: "Object",
					object: node,
					property: this.parseVariable()
				};
			}

			else if ( chr === '[' ) {

				var previousIsIdentifier = node && node.type === 'Identifier';
				args = this.parseArguments();

				if( previousIsIdentifier && args.length > 1 ) {

					throw Error("Expected only 1 Identifier");
				}

				node = {

					type: previousIsIdentifier ? 'Object' : 'Array',
					object: node,
					property: previousIsIdentifier ? args[0] : args
				};
			}

			else if ( chr === '(' ) {

				args = this.parseArguments();

				node = {

					type: 'Callable',
					callable: node
				};

				if( args ) {

					node.args = args;
				}
			}
		}

		this.read(true);

		return node;
	},

	/**
	 *
	 */
	parseArguments: function () {

		var node,
			args = [];

		this.read(true);

		while( node = this.parseExpression() ) {

			args.push(node);

			this.read(true);

			if( this.chr === ',' ) {

				this.read();
				this.read(true);
			}
		}

		this.read(true);

		if( this.chr !== ')' && this.chr !== ']' ) {

			throw Error("Unexpected function end");
		}

		this.read();

		return args.length ? args : null;
	},

	/**
	 *
	 */
	parseGroup: function () {

		var node;

		this.read();

		node = this.parseExpression();

		if( this.chr !== ')' ) {
			
			throw Error('Unexpected group end');
		}

		this.read();
		this.read(true);

		return {

			type: "Group",
			value: node
		};
	},

	/**
	 * {foo: 'bar', baz: 'baq'}
	 */
	parseObject: function () {

		var node,
			properties = [];

		this.read(true);

		while( this.read() ) {

			node = this.parseObjectProperty();

			if( !node ) {

				throw Error("Parse error");
			}

			properties.push(node);

			if( this.chr === '}' ) {

				break;
			}

			if( this.chr !== ',' ) {

				throw Error("Expected `,`");
			}

			this.read();
		}

		if( this.chr !== '}' ) {

			throw Error("Unexpected object end");
		}

		this.read();

		return {

			type: "Object",
			properties: properties
		};
	},

	/**
	 * `baz: 'baq'`
	 */
	parseObjectProperty: function () {

		var key,
			value;

		key = this.parseToken();
		// Force `Identifier`
		key.type = 'Identifier';

		this.read(true);

		if( this.chr !== ':' ) {

			throw Error("Expected `:`");
		}

		this.read(true);
		this.read();
		this.read(true);

		value = this.parseExpression();

		return {

			type: "Property",
			key: key,
			value: value
		}
	},

	/**
	 * foo ? true : false
	 */
	parseConditionalExpression: function ( left ) {

		var consequent,
			alternate;

		if( this.chr !== '?' ) {

			throw Error('Expected `?`');
		}

		this.read();
		this.read(true);

		consequent = this.parseExpression();

		if( this.chr !== ':' ) {

			throw Error('Expected `:`');
		}

		this.read();
		this.read(true);

		alternate = this.parseExpression();

		return {

			type: "ConditionalExpression",
			test: left,
			consequent: consequent,
			alternate: alternate
		}
	},

	/**
	 * -foo
	 * +foo
	 * !foo
	 */
	parseUnaryExpression: function () {

		var value = this.chr;

		this.read();

		if( this.is('+-') ) {

			value += this.chr;

			this.read();
		}

		return {

			type: "UnaryExpression",
			operator: value,
			value: this.parseExpression()

		};
	}
};

