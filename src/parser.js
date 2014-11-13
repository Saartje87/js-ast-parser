function Parser ( expression ) {

	expression = String(expression).trim();

	this.text = expression;
	this.length = expression.length;
	this.index = -1;
	this.chr = null;
};

Parser.prototype = {

	parse: function () {

		var token;

		this.read();

		/*if( this.is('[') ) {

			node = this.parseArray();
		} else if ( this.is('{') ) {

			node = this.parseGroup();
		} else if ( this.is('(') ) {

			node = this.parseGroup();
		}*/

		return this.parseExpression();

		var tokens = [],
			token;

		while ( this.read() ) {

			// if( this.is('[') ) {

			// }

			/*token = this.parseExpression();

			// Matches " or '
			if( this.is('"\'') ) {

				token = this.parseString();
			}

			else if ( this.is('(') ) {

				// parse group
			}

			// Add token
			if( token ) {

				tokens.push(token);
			}

			token = null;*/
		}

		return this.parseExpression();
	},

	parseExpression: function () {

		var left = this.parseToken(),
			operator = this.parseBinaryOperator(),
			right;

		return left;
	},

	parseToken: function () {

		if( this.is('0123456789') ) {

			return this.parseNumber()
		}

		if( this.is('"\'') ) {

			return this.parseString();
		}

		if( this.isIdentifierStart() ) {

			return this.parseIdentifier();
		}
	},

	parseBinaryOperator: function () {


	},

	/**
	 * Read next char
	 *
	 * @return {Boolean}
	 */
	read: function () {

		this.index += 1;

		if( this.index > this.length ) {

			return false;
		}

		this.chr = this.text[this.index];

		return true;
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

				console.log(value);
				throw Error('Parse error, unexpected end');
			}

			value += this.chr;
		}

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

			if( this.is('0123456789.') ) {

				value += this.chr;
			}
		}

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

		return {

			type: "Identifier",
			value: value
		};
	},

	peek: function ( i ) {

	}
};

