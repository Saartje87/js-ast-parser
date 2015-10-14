(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

exports['default'] = compile;

var Compiler = (function () {
	function Compiler() {
		_classCallCheck(this, Compiler);
	}

	_createClass(Compiler, [{
		key: 'compile',
		value: function compile(node) {

			// console.log('compile()', node);
			var context = this.precompile(node);

			return {
				/* jshint evil:true */
				callable: new Function('context', context.code),
				bindingPaths: context.bindings
			};
		}
	}, {
		key: 'precompile',
		value: function precompile(node) {
			var context = {
				code: 'return ',
				bindings: []
			};

			this.buffer = '';

			this.walk(node, context);

			console.log(context.code);
			console.log(context.bindings);

			return context;
		}
	}, {
		key: 'walk',
		value: function walk(node, context) {
			// console.log('walk()', node);
			if (typeof this[node.type] !== 'function') {
				console.log(node);
				throw new Error(this[node.type]);
			}
			this[node.type](node, context);
		}
	}, {
		key: 'Binary',
		value: function Binary(node, context) {
			this.walk(node.left, context);
			context.code += node.operator;
			this.walk(node.right, context);
		}
	}, {
		key: 'Callable',
		value: function Callable(node, context) {
			var _this = this;

			var argsLength = node.args.length - 1;
			this.walk(node.callable, context);

			var _members = this.members;
			this.members = null;
			context.code += '(';
			node.args.forEach(function (node, i) {
				_this.walk(node, context);
				context.code += argsLength !== i ? ',' : '';
			});
			context.code += ')';
			this.members = _members;
		}
	}, {
		key: 'Conditional',
		value: function Conditional(node, context) {
			this.walk(node.test, context);
			context.code += '?';
			this.walk(node.consequent, context);
			context.code += ':';
			this.walk(node.alternate, context);
		}
	}, {
		key: 'Number',
		value: function Number(node, context) {
			context.code += node.raw;
		}
	}, {
		key: 'Nested',
		value: function Nested(node, context) {
			context.code += '(';
			this.walk(node.value, context);
			context.code += ')';
		}
	}, {
		key: 'String',
		value: function String(node, context) {
			context.code += node.raw;
		}
	}, {
		key: 'Logical',
		value: function Logical(node, context) {
			this.walk(node.left, context);
			context.code += node.operator;
			this.walk(node.right, context);
		}
	}, {
		key: 'Identifier',
		value: function Identifier(node, context) {
			if (!this.members) {
				context.code += 'context.';
			}

			context.code += node.value;

			if (!this.members) {
				context.bindings.push(node.value);
			} else {
				this.members.push(node.value);
			}
		}
	}, {
		key: 'Assignment',
		value: function Assignment(node, context) {
			this.walk(node.left, context);
			context.code += '=';
			this.walk(node.right, context);
		}
	}, {
		key: 'Member',
		value: function Member(node, context) {
			var members = this.members;
			if (!members) {
				// console.log('Go');
				this.members = [];
				context.code += 'context.';
			}
			this.walk(node.object, context);
			if (node.computed) {
				context.code += '[';
				var _members = this.members;
				this.members = null;
				this.walk(node.property, context);
				this.members = _members;
				context.code += ']';
			} else {
				context.code += '.';
				this.walk(node.property, context);
			}
			if (!members) {
				// console.log('End');
				context.bindings.push(this.members.join('.'));
				this.members = null;
			}
		}
	}]);

	return Compiler;
})();

var compiler = new Compiler();

function compile(node) {

	return compiler.compile(node);
}
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

(function (context) {

	var Rocky = context.Rocky = context.Rocky || {};

	Rocky.compile = require('./compiler-esnext');
	Rocky.parse = require('./parser-esnext');
})(window);

},{"./compiler-esnext":1,"./parser-esnext":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

exports['default'] = parse;

var BINARY_OPERATORS = {
	'||': 1, '&&': 2, '|': 3, '^': 4, '&': 5,
	'==': 6, '!=': 6, '===': 6, '!==': 6,
	'<': 7, '>': 7, '<=': 7, '>=': 7,
	'<<': 8, '>>': 8, '>>>': 8,
	'+': 9, '-': 9,
	'*': 10, '/': 10, '%': 10
};

var LITERALS = {
	'true': true,
	'false': false,
	'null': null
	// 'undefined': undefined
};

var IS_NUMBER_START = '-.0123456789';
var IS_NUMBER = '0123456789.e';

var Parser = (function () {
	function Parser() {
		_classCallCheck(this, Parser);
	}

	_createClass(Parser, [{
		key: 'parse',

		/**
   * Parse given expression
   *
   * @return {Object} Tokens
   */
		value: function parse(expression) {

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
	}, {
		key: 'read',
		value: function read() {
			this.index += 1;

			if (this.index >= this.length) {
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
	}, {
		key: 'peek',
		value: function peek() {
			var steps = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			return this.text[this.index + steps] || '';
		}

		/**
   * Keep reading till we find a usable char
   */
	}, {
		key: 'moveon',
		value: function moveon() {
			while (this.is(" \t\n") && this.read()) {}
		}

		/**
   *
   */
	}, {
		key: 'skip',
		value: function skip(steps) {
			// -1 cause read does +1
			this.index += steps - 1;

			return this.read();
		}

		/**
   * Check if char is in given string
   */
	}, {
		key: 'is',
		value: function is(chars) {
			return this.current && chars.indexOf(this.current) !== -1;
		}

		// Parsers
	}, {
		key: 'parseToken',
		value: function parseToken() {
			if (!this.current) {
				throw new ParseError('Unexpected end');
			}

			if (this.is(IS_NUMBER_START) && this.peek() !== '-') {
				return this.parseNumber();
			}

			if (this.is('"\'')) {
				return this.parseString();
			}

			if (this.is('(')) {
				return this.parseNested();
			}

			if (this.is('!-+')) {
				return this.parseUnaryExpression();
			}

			if (this.is('[')) {
				return this.parseArray();
			}

			if (this.is('{')) {
				return this.parseObject();
			}

			if (this.isIdentifierStart()) {
				return this.parseVariable();
			}

			throw new ParseError('Could not parse');
		}
	}, {
		key: 'parseExpression',
		value: function parseExpression() {
			var left = this.parseToken();
			var operator = this.parseOperator();

			if (!this.current) {
				return left;
			}

			if (operator) {
				return this.parseBinaryExpression(left, operator);
			}

			if (this.is('?')) {
				return this.parseConditionalExpression(left);
			}

			if (this.is('=')) {
				return this.parseAssignmentExpression(left);
			}

			return left;
			// throw new ParseError('Errororrr '+this.current);
		}

		/**
   *
   */
	}, {
		key: 'parseArray',
		value: function parseArray() {
			var properties = [];
			var node;

			this.read();
			this.moveon();

			/* jshint boss: true */
			while (node = this.parseToken()) {

				properties.push(node);

				if (this.is(',')) {
					this.read();
					this.moveon();
				}
				// End of callable args
				else if (this.is(']')) {
						break;
					}
			}

			if (!this.is(']')) {
				throw new ParseError('Unexpected callable end');
			}

			this.read();
			this.moveon();

			return {
				type: 'Array',
				properties: properties
			};
		}
	}, {
		key: 'parseAssignmentExpression',
		value: function parseAssignmentExpression(left) {

			this.read();
			this.moveon();

			return {
				type: 'Assignment',
				left: left,
				right: this.parseExpression()
			};
		}
	}, {
		key: 'parseBinaryExpression',
		value: function parseBinaryExpression(_left, _operator) {
			// function argument is like a var..
			// TODO(Saar) Dont like this hack..
			var left = _left;
			var operator = _operator;

			if (!operator) {
				throw new ParseError('Euh errorrrr');
			}

			var right = this.parseToken();

			if (!right) {
				throw new ParseError('Invalid token after ' + operator.value);
			}

			var stack = [left, operator, right];

			/* jshint boss: true */
			for (var _operator2 = undefined, _node = undefined; _operator2 = this.parseOperator();) {

				while (stack.length > 2 && _operator2.precedence <= stack[stack.length - 2].precedence) {

					var _right = stack.pop();
					var _operator3 = stack.pop();
					var _left2 = stack.pop();

					_node = this.createOperatorExpression(_operator3.value, _left2, _right);

					stack.push(_node);
				}

				_node = this.parseToken();

				if (!_node) {
					throw new ParseError('Invalid token after ' + _operator2.value);
				}

				stack.push(_operator2, _node);
			}

			var i = stack.length - 1;
			var node = stack[i];

			while (i > 1) {

				node = this.createOperatorExpression(stack[i - 1].value, stack[i - 2], node);
				i -= 2;
			}

			return node;
		}
	}, {
		key: 'parseCallable',
		value: function parseCallable(node) {

			var args = [];

			// TODO(Saar) Code cleanup
			this.read();
			this.moveon();

			if (this.current === ')') {
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
	}, {
		key: 'parseCallableArguments',
		value: function parseCallableArguments() {
			var args = [],
			    node;

			/* jshint boss: true */
			while (node = this.parseExpression()) {

				args.push(node);

				if (this.is(',')) {
					this.read();
					this.moveon();
				}
				// End of callable args
				else if (this.is(')')) {
						break;
					}
			}

			if (!this.is(')')) {
				throw new ParseError('Unexpected callable end');
			}

			this.read();
			this.moveon();

			return args;
		}
	}, {
		key: 'parseConditionalExpression',
		value: function parseConditionalExpression(test) {
			this.read();
			this.moveon();

			var consequent = this.parseExpression();

			this.read();
			this.moveon();

			var alternate = this.parseExpression();

			return {
				type: 'Conditional',
				test: test,
				consequent: consequent,
				alternate: alternate
			};
		}
	}, {
		key: 'parseIdentifier',
		value: function parseIdentifier() {
			var value = this.current;

			while (this.read() && this.isIdentifierPart()) {
				value += this.current;
			}

			this.moveon();

			return LITERALS.hasOwnProperty(value) ? {
				type: 'Literal',
				value: LITERALS[value]
			} : {
				type: 'Identifier',
				value: value
			};
		}

		// parseLogicalExpression () {}
		// Or group?
	}, {
		key: 'parseNested',
		value: function parseNested() {
			this.read();
			this.moveon();

			var node = this.parseExpression();

			if (!this.is(')')) {
				throw new ParseError('Missing `)`');
			}

			this.read();
			this.moveon();

			return {
				type: 'Nested',
				value: node
			};
		}
	}, {
		key: 'parseMemberExpression',
		value: function parseMemberExpression(object) {
			var computed = !!this.is('[');

			this.read();
			this.moveon();

			var property = this.parseToken();

			if (computed) {
				this.read();
				this.moveon();
			}

			return {
				type: 'Member',
				computed: computed,
				object: object,
				property: property
			};
		}
	}, {
		key: 'parseOperator',
		value: function parseOperator() {
			var one = this.current,
			    two = one + this.peek(1),
			    three = two + this.peek(2),
			    value;

			if (BINARY_OPERATORS.hasOwnProperty(three)) {
				value = three;
				this.skip(3);
			} else if (BINARY_OPERATORS.hasOwnProperty(two)) {
				value = two;
				this.skip(2);
			} else if (BINARY_OPERATORS.hasOwnProperty(one)) {
				value = one;
				this.skip(1);
			}

			this.moveon();

			if (!value) {
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
	}, {
		key: 'parseNumber',
		value: function parseNumber() {
			var value = this.current;

			while (this.read()) {

				if (!this.is(IS_NUMBER)) {
					break;
				}

				value += this.current;
			}

			if (!value || value === '-' || value === '+') {
				throw new ParseError('Invalid number ' + value);
			}

			this.moveon();

			return {
				type: 'Number',
				value: parseFloat(value),
				raw: value
			};
		}
	}, {
		key: 'parseObject',
		value: function parseObject() {
			var properties = [];
			var node;

			this.read();
			this.moveon();

			// console.log(this.current);

			/* jshint boss: true */
			while (node = this.parseObjectProperty()) {

				properties.push(node);

				if (this.is(',')) {
					this.read();
					this.moveon();
				}
				// End of callable args
				else if (this.is('}')) {
						break;
					}
			}

			if (!this.is('}')) {
				throw new ParseError('Unexpected callable end');
			}

			this.read();
			this.moveon();

			return {
				type: 'Object',
				properties: properties
			};
		}
	}, {
		key: 'parseObjectProperty',
		value: function parseObjectProperty() {
			var key = this.parseToken();

			if (!this.is(':')) {
				throw new ParseError();
			}

			this.read();
			this.moveon();

			var value = this.parseExpression();

			return {
				type: 'Property',
				key: key,
				value: value
			};
		}
	}, {
		key: 'parseString',
		value: function parseString() {
			var value = '',
			    raw = this.current,
			    qoute = raw;

			while (this.read()) {

				raw += this.current;

				// Escaped qoutes
				if (this.current === '\\' && this.peek() === qoute) {
					value += qoute;
					raw += qoute;
					this.skip(1);
					continue;
				}

				if (this.current === qoute) {
					this.read();
					break;
				}

				if (!this.current) {
					throw new ParseError('Could not parse String');
				}

				value += this.current;
			}

			this.moveon();

			return {
				type: 'String',
				value: value,
				raw: raw
			};
		}
	}, {
		key: 'parseUnaryExpression',
		value: function parseUnaryExpression() {
			var value = this.current;

			this.read();

			// -- ++
			if (this.is('-+')) {
				value += this.current;
				this.read();
			}

			if (!this.peek(1)) {
				throw new ParseError();
			}

			return {
				type: 'Unary',
				operator: value,
				value: this.parseExpression()
			};
		}
	}, {
		key: 'parseVariable',
		value: function parseVariable() {

			var node = this.parseIdentifier();

			// Member [ or .
			if (this.is('.[')) {
				return this.parseMemberExpression(node);
			}

			// Callable
			if (this.is('(')) {
				return this.parseCallable(node);
			}

			return node;
		}

		// Helpers
	}, {
		key: 'isIdentifierStart',
		value: function isIdentifierStart() {
			var chrCode = this.current.charCodeAt(0);

			return chrCode === 36 || chrCode === 95 || // `$` and `_`
			chrCode >= 65 && chrCode <= 90 || // A...Z
			chrCode >= 97 && chrCode <= 122; // a...z
		}
	}, {
		key: 'isIdentifierPart',
		value: function isIdentifierPart() {
			var chrCode = this.current.charCodeAt(0);

			return chrCode === 36 || chrCode === 95 || // `$` and `_`
			chrCode >= 65 && chrCode <= 90 || // A...Z
			chrCode >= 97 && chrCode <= 122 || // a...z
			chrCode >= 48 && chrCode <= 57; // 0...9
		}
	}, {
		key: 'createOperatorExpression',
		value: function createOperatorExpression(operator, left, right) {
			var type = operator === '||' || operator === '&&' ? 'Logical' : 'Binary';

			return {
				type: type,
				operator: operator,
				left: left,
				right: right
			};
		}
	}]);

	return Parser;
})();

var parser = new Parser();

function parse(expression) {

	return parser.parse(expression.trim());
}

function ParseError(message) {

	this.name = 'ParseError';
	this.message = message || '';
	this.stack = new Error().stack;
}

ParseError.prototype = Object.create(Error.prototype);
module.exports = exports['default'];

},{}]},{},[2])


//# sourceMappingURL=ast.js.map