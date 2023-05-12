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

function assert(condition) {
    if (!condition)
        throw new Error("Bad assertion");
}

function shouldThrow(func, message) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== message)
        throw new Error("bad error: " + String(error));
}

var buffer = new ArrayBuffer(128);
var dataView = null;

dataView = new DataView(buffer);
assert(dataView.byteOffset === 0);
assert(dataView.byteLength === 128);

dataView = new DataView(buffer, undefined);
assert(dataView.byteOffset === 0);
assert(dataView.byteLength === 128);

dataView = new DataView(buffer, 10);
assert(dataView.byteOffset === 10);
assert(dataView.byteLength === 118);

dataView = new DataView(buffer, 10, undefined);
assert(dataView.byteOffset === 10);
assert(dataView.byteLength === 118);

dataView = new DataView(buffer, 10, 20);
assert(dataView.byteOffset === 10);
assert(dataView.byteLength === 20);

assert(new DataView(buffer, 10).byteLength === new DataView(buffer, 10, undefined).byteLength);

shouldThrow(() => {
    new DataView;
}, "TypeError: DataView constructor requires at least one argument.");

shouldThrow(() => {
    new DataView(1);
}, "TypeError: Expected ArrayBuffer for the first argument.");

shouldThrow(() => {
    new DataView(buffer, 256);
}, "RangeError: Length out of range of buffer");

shouldThrow(() => {
    new DataView(buffer, -1);
}, "RangeError: byteOffset cannot be negative");

shouldThrow(() => {
    new DataView(buffer, Infinity);
}, "RangeError: byteOffset too large");

shouldThrow(() => {
    new DataView(buffer, 0, 256);
}, "RangeError: Length out of range of buffer");

shouldThrow(() => {
    new DataView(buffer, 0, -1);
}, "RangeError: byteLength cannot be negative");

shouldThrow(() => {
    new DataView(buffer, 0, Infinity);
}, "RangeError: byteLength too large");
