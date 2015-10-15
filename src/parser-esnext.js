export default parse;

const BINARY_OPERATORS = {
	'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
	'==': 6, '!=': 6, '===': 6, '!==': 6,
	'<': 7,  '>': 7,  '<=': 7,  '>=': 7,
	'<<':8,  '>>': 8, '>>>': 8,
	'+': 9, '-': 9,
	'*': 10, '/': 10, '%': 10
};

const LITERALS = {
	'true': true,
	'false': false,
	'null': null
	// 'undefined': undefined
};

const IS_NUMBER_START = '-.0123456789';
const IS_NUMBER = '0123456789.e';

class Parser {

	/**
	 * Parse given expression
	 *
	 * @return {Object} Tokens
	 */
	parse ( expression ) {

		this.text = expression;
		this.length = expression.length;

		// Parse index
		this.index = -1;
		// Current character
		this.current = '';

		this.read();

		return this.parseExpression();
	}

	// -- Private method -- //
	read () {
		this.index += 1;

		if(this.index >= this.length) {
			this.current = '';
			return false;
		}

		this.current = this.text[this.index];

		return true;
	}

	/**
	 * Peak ahead.(or behind)
	 * Does not move this.index
	 * @return
	 */
	peek ( steps = 1 ) {
		return this.text[this.index + steps] || '';
	}

	/**
	 * Keep reading till we find a usable char
	 */
	moveon () {
		while( this.is(" \t\n") && this.read() ) {}
	}

	/**
	 *
	 */
	skip ( steps ) {
		// -1 cause read does +1
		this.index += steps - 1;

		return this.read();
	}

	/**
	 * Check if char is in given string
	 */
	is ( chars ) {
		return this.current && chars.indexOf(this.current) !== -1;
	}

	// Parsers
	parseToken () {
		if( !this.current ) {
			throw new ParseError('Unexpected end');
		}

		if( this.is(IS_NUMBER_START) && this.peek() !== '-' ) {
			return this.parseNumber();
		}

		if( this.is('"\'') ) {
			return this.parseString();
		}

		if( this.is('(') ) {
			return this.parseNested();
		}

		if( this.is('!-+') ) {
			return this.parseUnaryExpression();
		}

		if( this.is('[') ) {
			return this.parseArray();
		}

		if( this.is('{') ) {
			return this.parseObject();
		}

		if( this.isIdentifierStart() ) {
			return this.parseVariable();
		}

		throw new ParseError('Could not parse');
	}
	parseExpression () {
		let left = this.parseToken();
		let operator = this.parseOperator();

		if( !this.current ) {
			return left;
		}

		if( operator ) {
			return this.parseBinaryExpression(left, operator);
		}

		if( this.is('?') ) {
			return this.parseConditionalExpression(left);
		}

		if( this.is('=') ) {
			return this.parseAssignmentExpression(left);
		}

		if( this.is('.[') ) {
			return this.parseMemberExpression(left);
		}

		return left;
		// throw new ParseError('Errororrr '+this.current);
	}
	/**
	 *
	 */
	parseArray () {
		var properties = [];
		var node;

		this.read();
		this.moveon();

		/* jshint boss: true */
		while( node = this.parseExpression() ) {

			properties.push(node);

			if( this.is(',') ) {
				this.read();
				this.moveon();
			}
			// End of callable args
			else if( this.is(']') ) {
				break;
			}
		}

		if( !this.is(']') ) {
			throw new ParseError('Unexpected callable end');
		}

		this.read();
		this.moveon();

		return {
			type: 'Array',
			properties: properties
		};
	}
	parseAssignmentExpression ( left ) {

		this.read();
		this.moveon();

		return {
			type: 'Assignment',
			left: left,
			right: this.parseExpression()
		};
	}
	parseBinaryExpression ( _left, _operator ) {
		// function argument is like a var..
		// TODO(Saar) Dont like this hack..
		let left = _left;
		let operator = _operator;

		if( !operator ) {
			throw new ParseError('Euh errorrrr');
		}

		let right = this.parseToken();

		if( !right ) {
			throw new ParseError('Invalid token after '+operator.value);
		}

		let stack = [left, operator, right];

		/* jshint boss: true */
		for ( let operator, node; operator = this.parseOperator(); ) {

			while ( stack.length > 2 && operator.precedence <= stack[stack.length - 2].precedence ) {

				let right = stack.pop();
				let operator = stack.pop();
				let left = stack.pop();

				node = this.createOperatorExpression(operator.value, left, right);

				stack.push(node);
			}

			node = this.parseToken();

			if( !node ) {
				throw new ParseError('Invalid token after '+operator.value);
			}

			stack.push(operator, node);
		}

		let i = stack.length - 1;
		let node = stack[i];

		while ( i > 1 ) {

			node = this.createOperatorExpression(stack[i - 1].value, stack[i - 2], node);
			i -= 2;
		}

		return node;
	}
	parseCallable ( node ) {

		let args = [];

		// TODO(Saar) Code cleanup
		this.read();
		this.moveon();

		if( this.current === ')' ) {
			this.read();
			this.moveon();
		} else {
			args = this.parseCallableArguments();
		}

		return {
			type: 'Callable',
			callable: node,
			args: args
		};
	}
	parseCallableArguments () {
		var args = [],
			node;

		/* jshint boss: true */
		while( node = this.parseExpression() ) {

			args.push(node);

			if( this.is(',') ) {
				this.read();
				this.moveon();
			}
			// End of callable args
			else if( this.is(')') ) {
				break;
			}
		}

		if( !this.is(')') ) {
			throw new ParseError('Unexpected callable end');
		}

		this.read();
		this.moveon();

		return args;
	}
	parseConditionalExpression (test) {
		this.read();
		this.moveon();

		let consequent = this.parseExpression();

		this.read();
		this.moveon();

		let alternate = this.parseExpression();

		return {
			type: 'Conditional',
			test: test,
			consequent: consequent,
			alternate: alternate
		};
	}
	parseIdentifier () {
		var value = this.current;

		while ( this.read() && this.isIdentifierPart() ) {
			value += this.current;
		}

		this.moveon();

		return LITERALS.hasOwnProperty(value) ?
			{
				type: 'Literal',
				value: LITERALS[value]
			} :
			{
				type: 'Identifier',
				value: value
			};
	}
	// parseLogicalExpression () {}
	// Or group?
	parseNested () {
		this.read();
		this.moveon();

		let node = this.parseExpression();

		if( !this.is(')') ) {
			throw new ParseError('Missing `)`');
		}

		this.read();
		this.moveon();

		return {
			type: 'Nested',
			value: node
		};
	}
	parseMemberExpression ( object ) {
		let computed = !!this.is('[');

		this.read();
		this.moveon();

		let property = this.parseToken();

		if( computed ) {
			this.read();
			this.moveon();
		}

		let node = {
			type: 'Member',
			computed: computed,
			object: object,
			property: property
		};

		if( this.is('.[') ) {
			return this.parseMemberExpression(node);
		}

		return node;
	}
	parseOperator () {
		var one = this.current,
			two = one+this.peek(1),
			three = two+this.peek(2),
			value;

		if( BINARY_OPERATORS.hasOwnProperty(three) ) {
			value = three;
			this.skip(3);
		}
		else if ( BINARY_OPERATORS.hasOwnProperty(two) ) {
			value = two;
			this.skip(2);
		}
		else if ( BINARY_OPERATORS.hasOwnProperty(one) ) {
			value = one;
			this.skip(1);
		}

		this.moveon();

		if( !value ) {
			return;
		}

		return {
			value: value,
			precedence: BINARY_OPERATORS[value]
		};
	}
	/**
	 * 1, 1.234, 123, -1, -1.234
	 */
	parseNumber () {
		var value = this.current;

		while( this.read() ) {

			if( !this.is(IS_NUMBER) ) {
				break;
			}

			value += this.current;
		}

		if( !value || value === '-' || value === '+' ) {
			throw new ParseError('Invalid number '+value);
		}

		this.moveon();

		return {
			type: 'Number',
			value: parseFloat(value),
			raw: value
		};
	}
	parseObject () {
		var properties = [];
		var node;

		this.read();
		this.moveon();

		/* jshint boss: true */
		while( node = this.parseObjectProperty() ) {

			properties.push(node);

			if( this.is(',') ) {
				this.read();
				this.moveon();
			}
			// End of callable args
			else if( this.is('}') ) {
				break;
			}
		}

		if( !this.is('}') ) {
			throw new ParseError('Unexpected callable end');
		}

		this.read();
		this.moveon();

		return {
			type: 'Object',
			properties: properties
		};
	}
	parseObjectProperty () {
		let key = this.parseToken();

		if( !this.is(':') ) {
			throw new ParseError();
		}

		this.read();
		this.moveon();

		let value = this.parseExpression();

		return {
			type: 'Property',
			key,
			value
		};
	}
	parseString () {
		var value = '',
			raw = this.current,
			qoute = raw;

		while ( this.read() ) {

			raw += this.current;

			// Escaped qoutes
			if( this.current === '\\' && this.peek() === qoute ) {
				value += qoute;
				raw += qoute;
				this.skip(1);
				continue;
			}

			if( this.current === qoute ) {
				this.read();
				break;
			}

			if( !this.current ) {
				throw new ParseError('Could not parse String');
			}

			value += this.current;
		}

		this.moveon();

		return {
			type: 'String',
			value,
			raw
		};
	}
	parseUnaryExpression () {
		let value = this.current;

		this.read();

		// -- ++
		if( this.is('-+') ) {
			value += this.current;
			this.read();
		}

		if( !this.peek(1) ) {
			throw new ParseError();
		}

		return {
			type: 'Unary',
			operator: value,
			value: this.parseExpression()
		};
	}
	parseVariable () {

		var node = this.parseIdentifier();

		// Member [ or .
		if( this.is('.[') ) {
			return this.parseMemberExpression(node);
		}

		// Callable
		if( this.is('(') ) {
			return this.parseCallable(node);
		}

		return node;
	}

	// Helpers
	isIdentifierStart () {
		var chrCode = this.current.charCodeAt(0);

		return (chrCode === 36) || (chrCode === 95) || // `$` and `_`
			(chrCode >= 65 && chrCode <= 90) || // A...Z
			(chrCode >= 97 && chrCode <= 122); // a...z
	}

	isIdentifierPart () {
		var chrCode = this.current.charCodeAt(0);

		return (chrCode === 36) || (chrCode === 95) || // `$` and `_`
			(chrCode >= 65 && chrCode <= 90) || // A...Z
			(chrCode >= 97 && chrCode <= 122) || // a...z
			(chrCode >= 48 && chrCode <= 57); // 0...9
	}

	createOperatorExpression ( operator, left, right ) {
		let type = (operator === '||' || operator === '&&') ? 'Logical' : 'Binary';

		return {
			type: type,
			operator: operator,
			left: left,
			right: right
		};
	}
}

const parser = new Parser();

function parse (expression) {

	return parser.parse(expression.trim());
}

function ParseError( message ) {

	this.name = 'ParseError';
	this.message = message || '';
	this.stack = (new Error()).stack;
}

ParseError.prototype = Object.create(Error.prototype);
