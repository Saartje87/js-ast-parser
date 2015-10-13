export default compile;

class Compiler {

	compile (node) {

		// console.log('compile()', node);
		var context = this.precompile(node);

		return {
			/* jshint evil:true */
			callable: new Function('context', context.code),
			bindingPaths: context.bindings
		};
	}

	precompile (node) {
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

	walk (node, context) {
		// console.log('walk()', node);
		if( typeof this[node.type] !== 'function' ) {
			console.log(node);
			throw new Error(this[node.type]);
		}
		this[node.type](node, context);
	}

	'Binary' (node, context) {
		this.walk(node.left, context);
		context.code += node.operator;
		this.walk(node.right, context);
	}

	'Callable' (node, context) {
		var argsLength = node.args.length - 1;
		this.walk(node.callable, context);
		context.code += '(';
		node.args.forEach((node, i) => {
			this.walk(node, context);
			context.code += argsLength !== i ? ',' : '';
		});
		context.code += ')';
	}

	'Conditional' (node, context) {
		this.walk(node.test, context);
		context.code += '?';
		this.walk(node.consequent, context);
		context.code += ':';
		this.walk(node.alternate, context);
	}

	'Number' (node, context) {
		context.code += node.raw;
	}

	'Nested' (node, context) {
		context.code += '(';
		this.walk(node.value, context);
		context.code += ')';
	}

	'String'(node, context) {
		context.code += node.raw;
	}

	'Logical' (node, context) {
		this.walk(node.left, context);
		context.code += node.operator;
		this.walk(node.right, context);
	}

	'Identifier' (node, context) {
		context.code += node.value;

		if(!this.members){
			context.bindings.push(node.value);
		} else {
			this.members.push(node.value);
		}
	}

	'Assignment' (node, context) {
		this.walk(node.left, context);
		context.code += '=';
		this.walk(node.right, context);
	}

	'Member' (node, context) {
		let members = this.members;
		if(!members) {
			// console.log('Go');
			this.members = [];
			context.code += 'context.';
		}
		this.walk(node.object, context);
		if( node.computed ) {
			context.code += '[';
			this.walk(node.property, context);
			context.code += ']';
		} else {
			context.code += '.';
			this.walk(node.property, context);
		}
		if(!members) {
			// console.log('End');
			context.bindings.push(this.members.join('.'));
			this.members = null;
		}
	}
}

function compile (node) {
	let compiler = new Compiler();

	return compiler.compile(node);
}
