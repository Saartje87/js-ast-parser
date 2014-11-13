function Parser ( expression ) {

	this.text = expression;
	this.length = expression.length;
	this.index = -1;
	this.chr = null;
};

Parser.prototype = {

	parse: function () {

		var tokens = [],
			token;

		while ( this.read() ) {

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

			token = null;
		}

		return tokens[0];
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
			qoute = this.chr,
			escape = false;

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
		}
	},

	/**
	 *
	 */
	parseNumber: function () {


	},

	/**
	 * may start with [$_A-Za-z]
	 * mat contain [$_A-Za-z0-9]
	 */
	parseIdentifier: function () {


	},

	peek: function ( i ) {

	}
};

