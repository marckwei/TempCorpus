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

//@ runFTLNoCJIT

// If all goes well, this test module will terminate silently. If not, it will print
// errors. See unary-op-test.js for debugging options if needed.

load("./resources/unary-op-test.js", "caller relative");

//============================================================================
// Test configuration data:

var opName = "postinc";
var op = "++";
var operatorType = "Postfix";

var o1 = {
    valueOf: function() { return 10; }
};

var posInfinity = 1 / 0;
var negInfinity = -1 / 0;

var values = [
    'o1',
    'null',
    'undefined',
    'true',
    'false',

    'NaN',
    'posInfinity',
    'negInfinity',
    '100.2', // Some random small double value.
    '-100.2',
    '54294967296.2923', // Some random large double value.
    '-54294967296.2923',

    '0',
    '-0',
    '1',
    '-1',
    '0x3fff',
    '-0x3fff',
    '0x7fff',
    '-0x7fff',
    '0x10000',
    '-0x10000',
    '0x7ffffff',
    '-0x7ffffff',
    '0x80000000',
    '-0x80000000',
    '0x100000000',
    '-0x100000000',

    '"abc"',
    '"0"',
    '"-0"',
    '"1"',
    '"-1"',
    '"0x3fff"',
    '"-0x3fff"',
    '"0x7fff"',
    '"-0x7fff"',
    '"0x10000"',
    '"-0x10000"',
    '"0x7ffffff"',
    '"-0x7ffffff"',
    '"0x100000000"',
    '"-0x100000000"',
];

tests = [];
generateBinaryTests(tests, opName, operatorType, "ImmediateResult", op, values);
generateBinaryTests(tests, opName, operatorType, "PostResult", op, values);

run();
