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
"This tests Strict Equality Comparison results with Symbols."
);

var symbol = Symbol("Cocoa");
var symbolObject = Object(symbol);
// Test Abstract Relational Comparison.
var relationalOperators = [
    "===", "!=="
];
var object = {};
var array = [];
var date = new Date();

function Pair(key, result) {
    return [ key, result ];
}

relationalOperators.forEach(function (op) {
    var targets = [
        Pair("42", false),
        Pair("NaN", false),
        Pair("Infinity", false),
        Pair("true", false),
        Pair("false", false),
        Pair("null", false),
        Pair("undefined", false),
        Pair("'Cappuccino'", false),
        Pair("symbol", true),
        Pair("Symbol.iterator", false),
        Pair("object", false),
        Pair("array", false),
        Pair("date", false),
        Pair("symbolObject", false),
        Pair("Symbol('Cocoa')", false),
    ];

    targets.forEach(function (pair) {
        var target = pair[0];
        var result = pair[1];
        if (op === "!==") {
            result = !result;
        }
        shouldBe(target + " " + op + " symbol", String(result));
        shouldBe("symbol " + op + " " + target, String(result));
    });
});

successfullyParsed = true;
