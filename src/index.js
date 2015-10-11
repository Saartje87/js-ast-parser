(function (context){

	let Rocky = context.Rocky = context.Rocky || {};

	Rocky.compile = require('./compile');
	Rocky.parse = require('./parser-esnext');
})(window);
