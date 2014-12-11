/**
 * Wrapper function that tokenize input
 *
 * @return {Tree}
 */
function Tokenize ( expression ) {

	try {

		return (new Parser(expression)).parse();
	} catch ( e ) {

		throw e;
	}
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

	/**
	 *
	 */
	parse: function () {

		this.read();

		return this.parseExpression();
	},

	/**
	 *
	 */
	parseExpression: function () {

		var left = this.parseToken(),
			operator = this.parseOperator(),
			right,
			node;

		if( !operator ) {

			return left;
		}

		right = this.parseToken();

		return this.createBinaryExpression(operator.value, left, right);
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

		if( this.is('0123456789') ) {

			return this.parseNumber();
		}

		if( this.is('"\'') ) {

			return this.parseString();
		}

		if( this.is('(') ) {

			return this.parseGroup();
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

			type: "Identifier",
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

				args = node && node.type === 'Identifier';

				node = {

					type: args ? 'Object' : 'Array',
					object: node,
					property: args ? this.parseToken() : this.parseArguments()
				};

				this.read();
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
	}
};

