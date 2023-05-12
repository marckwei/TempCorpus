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

description(
"This tests Symbol object behaviors."
);

// Symbol constructor cannot be called with `new` style.
// To create Symbol object, call `Object(symbol)`.
shouldThrow("new Symbol", "\"TypeError: function is not a constructor (evaluating 'new Symbol')\"");
shouldThrow("new Symbol('Cappuccino')", "\"TypeError: function is not a constructor (evaluating 'new Symbol('Cappuccino')')\"");

var symbolObject = Object(Symbol.iterator);
shouldBeTrue("symbolObject instanceof Symbol");
// Since Symbol object's @@toPrimitive returns Symbol value,
// ToString(symbol) will be called.
shouldThrow("String(symbolObject)", `"TypeError: Cannot convert a symbol to a string"`);
shouldBeEqualToString("symbolObject.toString()", "Symbol(Symbol.iterator)");

var object = {};
object[symbolObject] = 42;
// ToPropertyKey(symbolObject) will call toPrimitive(symbolObject), and toPrimitive(symbolObject) will return symbol primitive value. As a result, object[symbolObject] equals to object[symbol in the symbolObject].
shouldBe("object[symbolObject]", "42");
shouldBe("object['Symbol(Symbol.iterator)']", "undefined");
shouldBe("object[Symbol.iterator]", "42");

var symbol = Symbol("Matcha");
object[symbol] = 'Cocoa';
shouldBeEqualToString("object[symbol]", "Cocoa");
shouldBeEqualToString("object[symbol.valueOf()]", "Cocoa");
shouldBeEqualToString("object[Object(symbol)]", "Cocoa");
shouldBe("object['Matcha']", "undefined");

// ToObject will be called.
shouldBe("Symbol.iterator.hello", "undefined");

successfullyParsed = true;
