'use strict';

function Compile ( tree ) {

	if( !tree ) {
		return;
	}

	// let ctx = compile(tree);
	// let body = 'return ' + tree.body

	// foo.bar + 2
	// ctx.body -> function body 'ctx.foo.bar + 2'
	// ctx.paths = ['foo.bar']

	var links = [];

	paths(tree, links);

	var ctx = {
		/* jshint evil:true */
		body: new Function('context', 'return ' + compile(tree)),
		/* jshint evil:false */
		paths: links
	};

	// console.log(paths(tree));

	// console.log(ctx.body);

	return ctx;
}

window.paths = paths;
function objectPath ( node ) {
	var path = node.object.value;

	if( node.property.type === 'Object' ) {
		return path+'.'+objectPath(node.property);
	} else if ( node.property.type === 'Identifier' ) {
		return path+'.'+node.property.value;
	}

	return path;
}
function paths ( node, list ) {

	var value;

	switch (node.type) {
		case 'String':
		case 'Value':
		case 'NewArray':
		case 'Group':
		case 'Literal':
			break;
		case 'Identifier':
		case 'UnaryExpression':
			list.push(node.value);
			break;
		case 'ConditionalExpression':
			paths(node.test, list);
			paths(node.consequent, list);
			paths(node.alternate, list);
			break;
		case 'BinaryExpression':
		case 'LogicalExpression':
		case 'AssignmentExpression':
			paths(node.left, list);
			paths(node.right, list);
			break;
		case 'Callable':
			paths(node.callable, list);
			(node.args || []).forEach(function (arg) {
				paths(arg, list);
			});
			break;
		case 'Object':
			list.push(objectPath(node));
			break;

		default:
			// console.warn(node);
			throw 'Not supported ' + node.type;
	}
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
			if( prefix && node.value === 'this' ) prefix = false;
			value = (prefix ? 'context.' : '') + node.value;
			break;
		case 'Object':
			var propertyType = node.property.type;
			value = compile(node.object, prefix) +
				(propertyType === 'Object' || propertyType === 'Identifier' ? '.'+compile(node.property, false) : '['+compile(node.property, false)+']');
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
		case 'ConditionalExpression':
			value = compile(node.test)+'?'+compile(node.consequent)+':'+compile(node.alternate);
			break;
		case 'AssignmentExpression':
			// Using set method for Rocky.Object
			value = 'context.set(\''+compile(node.left, false)+'\', '+compile(node.right)+')';
			break;

		default:
			console.warn(node);
			throw 'Not supported ' + node.type;
	}

	return value;
}
