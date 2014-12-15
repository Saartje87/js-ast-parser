# SandwichJS expression parser

Javascript AST parser for 'simple' expressions.

## Run tests

~~~bash
karma start
~~~

## Usage

~~~js
// var tokens = Tokenize('1 + foo');
var fn = Compile('1 + foo');
// fn.tokens
// fn.tokens.watchers -> i guess only variable names have to be watched
// Obj.$watch(fn.tokens.watchers, function () { /* Handle changes `fn(Obj)` */ })
fn({foo: 9}); // => 10

var fn = Sandwich.compile('1 + foo');

// fn.tokens.watchers

fn({foo: 1});
~~~

## Supported expressions

* Numbers (1, 1.23)
* Strings ('foo')
* BinaryExpression (+-%/*)
* LogicalExpression (|| &&)
* Identifier (foo)
* Objects (foo.bar, foo['bar'])
* Arrays (foo[0])
* Functions (foo(), foo('bar'))
* Nested expressions (a || b && c)
* Literals (true, false, null)

## Roadmap

* Performance
* More opperators
* Compile functionality
* Better and more usefull errors

### Add support for

* !!foo
* true ? 'yes' : 'no'
* foo = 'bar' // Assignment

### Todo tests

```js
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

foo(a(1), b(2))
// fails

a[1, 2]
// fails
```

### Add support for parseErrors

*








parser -> parse string to AST
compiler -> compiles AST to callable

result -> 
```js
var fn = Sandwich.compile('1 + 1');
fn(); //-> 2

// Deepter api
```
