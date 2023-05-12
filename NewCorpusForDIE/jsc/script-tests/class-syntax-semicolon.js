function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

description('Tests for ES6 class syntax containing semicolon in the class body');

shouldThrow("class A { foo() ; { } }", "'SyntaxError: Unexpected token \\\';\\'. Expected an opening \\'{\\' at the start of a method body.'");
shouldThrow("class A { get foo() ; { } }", "'SyntaxError: Unexpected token \\\';\\'. Expected an opening \\'{\\' at the start of a getter body.'");
shouldThrow("class A { set foo(x) ; { } }", "'SyntaxError: Unexpected token \\\';\\'. Expected an opening \\'{\\' at the start of a setter body.'");

shouldNotThrow("class A { ; }");
shouldNotThrow("class A { foo() { } ; }");
shouldNotThrow("class A { get foo() { } ; }");
shouldNotThrow("class A { set foo(x) { } ; }");
shouldNotThrow("class A { static foo() { } ; }");
shouldNotThrow("class A { static get foo() { } ; }");
shouldNotThrow("class A { static set foo(x) { } ; }");

shouldNotThrow("class A { ; foo() { } }");
shouldNotThrow("class A { ; get foo() { } }");
shouldNotThrow("class A { ; set foo(x) { } }");
shouldNotThrow("class A { ; static foo() { } }");
shouldNotThrow("class A { ; static get foo() { } }");
shouldNotThrow("class A { ; static set foo(x) { } }");

shouldNotThrow("class A { foo() { } ; foo() {} }");
shouldNotThrow("class A { foo() { } ; get foo() {} }");
shouldNotThrow("class A { foo() { } ; set foo(x) {} }");
shouldNotThrow("class A { foo() { } ; static foo() {} }");
shouldNotThrow("class A { foo() { } ; static get foo() {} }");
shouldNotThrow("class A { foo() { } ; static set foo(x) {} }");

shouldNotThrow("class A { get foo() { } ; foo() {} }");
shouldNotThrow("class A { get foo() { } ; get foo() {} }");
shouldNotThrow("class A { get foo() { } ; set foo(x) {} }");
shouldNotThrow("class A { get foo() { } ; static foo() {} }");
shouldNotThrow("class A { get foo() { } ; static get foo() {} }");
shouldNotThrow("class A { get foo() { } ; static set foo(x) {} }");

shouldNotThrow("class A { set foo(x) { } ; foo() {} }");
shouldNotThrow("class A { set foo(x) { } ; get foo() {} }");
shouldNotThrow("class A { set foo(x) { } ; set foo(x) {} }");
shouldNotThrow("class A { set foo(x) { } ; static foo() {} }");
shouldNotThrow("class A { set foo(x) { } ; static get foo() {} }");
shouldNotThrow("class A { set foo(x) { } ; static set foo(x) {} }");

shouldNotThrow("class A { static foo() { } ; foo() {} }");
shouldNotThrow("class A { static foo() { } ; get foo() {} }");
shouldNotThrow("class A { static foo() { } ; set foo(x) {} }");
shouldNotThrow("class A { static foo() { } ; static foo() {} }");
shouldNotThrow("class A { static foo() { } ; static get foo() {} }");
shouldNotThrow("class A { static foo() { } ; static set foo(x) {} }");

shouldNotThrow("class A { static get foo() { } ; foo() {} }");
shouldNotThrow("class A { static get foo() { } ; get foo() {} }");
shouldNotThrow("class A { static get foo() { } ; set foo(x) {} }");
shouldNotThrow("class A { static get foo() { } ; static foo() {} }");
shouldNotThrow("class A { static get foo() { } ; static get foo() {} }");
shouldNotThrow("class A { static get foo() { } ; static set foo(x) {} }");

shouldNotThrow("class A { static set foo(x) { } ; foo() {} }");
shouldNotThrow("class A { static set foo(x) { } ; get foo() {} }");
shouldNotThrow("class A { static set foo(x) { } ; set foo(x) {} }");
shouldNotThrow("class A { static set foo(x) { } ; static foo() {} }");
shouldNotThrow("class A { static set foo(x) { } ; static get foo() {} }");
shouldNotThrow("class A { static set foo(x) { } ; static set foo(x) {} }");

var successfullyParsed = true;
