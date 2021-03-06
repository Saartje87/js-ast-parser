# AST parser
# Rocky - Exprast (ExpressionAST)

Javascript AST parser for 'simple' expressions.

## Install

~~~bash
npm install -g karma-cli
npm install
~~~

## Run tests

~~~bash
karma start
~~~

## Usage

~~~js
var tree = Tokenize('1 + foo');

console.log(tree);
~~~

## Supported expressions

* Numbers (1, 1.23, 1e3, -200)
* Strings ('foo')
* BinaryExpression (+-%/\*)
* LogicalExpression (|| &&)
* Identifier (foo)
* Objects (foo.bar, foo['bar'])
* Arrays (foo[0])
* Functions/Callable (foo(), foo('bar'))
* Nested expressions (a || b && c)
* Literals (true, false, null)
* ConditionalExpressions (foo ? true : false)
* Unary Expression (!foo, --bar)
* Assignment Expression (foo = 'bar')

## Roadmap

* Performance
* More operators
* Compile AST to callable
* Throw error when string could not be parsed

~~~js
var tree = Tokenize('1 + foo');
var callable = Compile();  

callable({foo: 2}); // Outputs '3'
~~~
* Better and more usefull errors

### Add support for

* foo++
* foo--
* !activeTab || activeTab === 'intern'
* !foo || bar
* foo.bar.baz['a']['b']

### Todo tests

~~~js
foo['a'].bar.baz
// fails, outputs. property should be type: identifier with value: baz
{
	"type": "Object",
	"object": {
		"type": "Object",
		"object": {
			"type": "Identifier",
			"value": "foo"
		},
		"property": {
			"type": "String",
			"value": "a"
		}
	},
	"property": {
		"type": "Object",
		"object": {
			"type": "Identifier",
			"value": "bar"
		},
		"property": {
			"type": "Identifier",
			"value": "baz"
		}
	}
}
~~~

### Add parser errors
