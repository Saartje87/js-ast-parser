# SandwichJS expression parser

Javascript AST parser for 'simple' expressions.

## Run tests

~~~bash
karma run karma.conf.js
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