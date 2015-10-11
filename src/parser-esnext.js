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

	// constructor (expression) {
	// 	this.text = expression;
	// 	this.length = expression.length;
	//
	// 	// Parse index
	// 	this.index = -1;
	// 	// Current character
	// 	this.current = '';
	// }

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

		return this.parseToken();
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

		if( this.isIdentifierStart() ) {
			return this.parseVariable();
		}

		throw 'Could not parse';

		// return this.parseVariable();
	}
	/**
	 *
	 */
	parseArray () {}
	parseAssignmentExpression () {}
	parseBinaryExpression () {}
	parseCallable ( node ) {

		this.read();
		this.moveon();

		return {
			type: 'Callable',
			callable: node,
			args: this.current === ')' ? [] : this.parseCallableArguments()
		};
	}
	parseCallableArguments () {
		var args = [],
			node;

		/* jshint boss: true */
		while( node = this.parseToken() ) {

			args.push(node);

			if( this.is(',') ) {
				this.read();
				this.moveon();
			}

			if( this.is(')') ) {
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
	parseLogicalExpression () {}
	// Or group?
	parseNested () {}
	parseMemberExpression () {
		return {
			type: 'MemberExpression',
			computed: false, // True when shoud use []
			object: {},
			property: {}
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
			value: parseFloat(value)
		};
	}
	parseObject () {}
	parseString () {
		var value = '',
			qoute = this.current;

		while ( this.read() ) {

			// Escaped qoutes
			if( this.current === '\\' && this.peek() === qoute ) {				value += qoute;
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
			value: value
		};
	}
	parseUnaryExpression () {}
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
}

function parse (expression) {
	let parser = new Parser(); // Could be outside created (singleton)

	return parser.parse(expression.trim());
}

function ParseError( message ) {

	this.name = 'ParseError';
	this.message = message || '';
	this.stack = (new Error()).stack;
}

ParseError.prototype = Error.prototype;
