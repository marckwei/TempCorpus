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

var a = new Int32Array(new ArrayBuffer(100), 4, 1);

if (a.length != 1)
    throw "Error: bad length (start): " + a.length;
if (a.byteOffset != 4)
    throw "Error: bad offset (start): " + a.byteOffset;
if (a.byteLength != 4)
    throw "Error: bad byte length (start): " + a.byteLength;

function foo(when) {
    var tmp = a.length;
    if (tmp != 1)
        throw "Error: bad length (" + when + "): " + tmp;
    tmp = a.byteOffset;
    if (tmp != 4)
        throw "Error: bad offset (" + when + "): " + tmp;
    tmp = a.byteLength;
    if (tmp != 4)
        throw "Error: bad byte length (" + when + "): " + tmp;
}

for (var i = 0; i < 1000000; ++i)
    foo("loop");

transferArrayBuffer(a.buffer);

var didThrow = false;
try {
    foo("after transfer");
} catch (e) {
    didThrow = true;
}

if (!didThrow)
    throw "Should have thrown.";
