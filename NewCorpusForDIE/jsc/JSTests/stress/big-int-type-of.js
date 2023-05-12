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

function assert(a) {
    if (!a)
        throw new Error("Bad assertion");
}

assert(typeof 0n === "bigint");
assert(typeof 1n !== "object");

function typeOf(value)
{
    return typeof value;
}
noInline(typeOf);

var object = {};
var func = function () { };
var bigInt = 1n;
var number = 0;
var string = "String";
var symbol = Symbol("Symbol");

for (var i = 0; i < 1e6; ++i) {
    assert(typeOf(object) === "object");
    assert(typeOf(func) === "function");
    assert(typeOf(bigInt) === "bigint");
    assert(typeOf(number) === "number");
    assert(typeOf(string) === "string");
    assert(typeOf(symbol) === "symbol");
    assert(typeOf(null) === "object");
    assert(typeOf(undefined) === "undefined");
    assert(typeOf(true) === "boolean");
}
