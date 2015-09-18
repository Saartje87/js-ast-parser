'use strict';

function Compile ( tree ) {

	if( !tree ) {
		return
	};

	let body = 'return ' + compile(tree);

	// foo.bar + 2
	// ctx.body -> function body 'ctx.foo.bar + 2'
	// ctx.paths = ['foo.bar']

	console.log(body);

	return new Function('context', body);
}

function compile ( node, prefix ) {

	var value;

	prefix = (prefix === undefined) ? true : prefix;

	// console.log('ke', node, prefix);

	switch (node.type) {
		case 'Value':
		case 'Literal':
			value = node.value;
			break;
		case 'String':
			value = '"' + node.value + '"';
			break;
		case 'BinaryExpression':
		case 'LogicalExpression':
			value = compile(node.left) + node.operator + compile(node.right);
			break;
		case 'Identifier':
			value = (prefix ? 'context.' : '') + node.value;
			break;
		case 'Object':
			value = compile(node.object, prefix) + '.' + compile(node.property, false);
			break;
		case 'UnaryExpression':
			value = node.operator + compile(node.value);
			break;
		case 'NewArray':
			value = '['+(node.property || []).map(function ( node ) {
				return compile(node);
			}).join(',')+']';
			break;
		case 'NewObject':
			value = '{' + (node.properties || []).map(function ( node ) {
				return compile(node);
			}).join(',') + '}';
			break;
		case 'Property':
			value = compile(node.key, false) + ': ' + compile(node.value);
			break;
		case 'Callable':
			value = compile(node.callable, prefix) + '(' + (node.args || []).map(function ( node ) {
				return compile(node);
			}).join(',') + ')';
			break;
		case 'Group':
			value = '('+compile(node.value)+')';
			break;

		default:
			console.warn(node);
			throw 'Not supported ' + node.type;
	}

	return value;
}
