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
~~~

## Supported expressions

* binary operators (+-%/)

## Roadmap

### Add support for

* a || b || 'thiees'
* (a * 2) + 10
* funcA() || funcB()
* [1, 2]
* {foo: 'bar'}
* !!foo
* ('foo')
* [['foo'], [2]]
* true ? 'yes' : 'no'
* true
* false
* null

### Add support for parseErrors

*