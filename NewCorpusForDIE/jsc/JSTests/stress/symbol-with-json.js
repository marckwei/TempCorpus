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

// This tests JSON correctly behaves with Symbol.

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

shouldBe(JSON.stringify(Symbol('Cocoa')), undefined);

var object = {};
var symbol = Symbol("Cocoa");
object[symbol] = 42;
object['Cappuccino'] = 42;
shouldBe(JSON.stringify(object), '{"Cappuccino":42}');

shouldBe(JSON.stringify(object, [ Symbol('Cocoa') ]), "{}");

// The property that value is Symbol will be ignored.
shouldBe(JSON.stringify({ cocoa: Symbol('Cocoa'), cappuccino: Symbol('Cappuccino') }), '{}');
shouldBe(JSON.stringify({ cocoa: Symbol('Cocoa'), cappuccino: 'cappuccino', [Symbol('Matcha')]: 'matcha' }), '{"cappuccino":"cappuccino"}');
var object = {foo: Symbol()};
object[Symbol()] = 1;
shouldBe(JSON.stringify(object), '{}');

// The symbol value included in Array will be converted to null
shouldBe(JSON.stringify([ Symbol('Cocoa') ]), '[null]');
shouldBe(JSON.stringify([ "hello", Symbol('Cocoa'), 'world' ]), '["hello",null,"world"]');
var array = [Symbol()];
shouldBe(JSON.stringify(array), '[null]');
