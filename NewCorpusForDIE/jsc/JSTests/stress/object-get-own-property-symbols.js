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

// This tests Object.getOwnPropertySymbols.

var global = (Function("return this")());

// private names for privileged code should not be exposed.
var globalSymbols = Object.getOwnPropertySymbols(global).filter(s => s !== Symbol.toStringTag);
if (globalSymbols.length !== 0)
    throw "Error: bad value " + globalSymbols.length;

var object = {};
var symbol = Symbol("Cocoa");
object[symbol] = "Cappuccino";
if (Object.getOwnPropertyNames(object).length !== 0)
    throw "Error: bad value " + Object.getOwnPropertyNames(object).length;
if (Object.getOwnPropertySymbols(object).length !== 1)
    throw "Error: bad value " + Object.getOwnPropertySymbols(object).length;
if (Object.getOwnPropertySymbols(object)[0] !== symbol)
    throw "Error: bad value " + String(Object.getOwnPropertySymbols(object)[0]);

function forIn(obj) {
    var array = [];
    // Symbol should not be enumerated.
    for (var key in obj) array.push(key);
    return array;
}

if (forIn(object).length !== 0)
    throw "Error: bad value " + forIn(object).length;
if (Object.keys(object).length !== 0)
    throw "Error: bad value " + Object.keys(object).length;

delete object[symbol];
if (Object.getOwnPropertyNames(object).length !== 0)
    throw "Error: bad value " + Object.getOwnPropertyNames(object).length;
if (Object.getOwnPropertySymbols(object).length !== 0)
    throw "Error: bad value " + Object.getOwnPropertySymbols(object).length;
