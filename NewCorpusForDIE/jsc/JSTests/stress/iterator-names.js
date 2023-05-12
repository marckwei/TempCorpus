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

function test(object, name) {
    return {
        object,
        name: '[object ' + name + ']'
    };
}

function iter(object) {
    return object[Symbol.iterator]();
}

var tests = [
    test(iter([]), "Array Iterator"),
    test(iter(new Array), "Array Iterator"),
    test([].keys(), "Array Iterator"),
    test([].entries(), "Array Iterator"),
    test(iter(new Map), "Map Iterator"),
    test((new Map()).keys(), "Map Iterator"),
    test((new Map()).entries(), "Map Iterator"),
    test(iter(new Set), "Set Iterator"),
    test((new Set()).keys(), "Set Iterator"),
    test((new Set()).entries(), "Set Iterator"),
    test(iter(new String("")), "String Iterator"),
    test(iter(""), "String Iterator"),
];

function check(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

for (var { object, name } of tests) {
    check(object.toString(), name);
    check(Object.prototype.toString.call(object), name);
}
