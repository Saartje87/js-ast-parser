(function (context){

	let Rocky = context.Rocky = context.Rocky || {};

	Rocky.compile = require('./compiler-esnext');
	Rocky.parse = require('./parser-esnext');
})(window);
