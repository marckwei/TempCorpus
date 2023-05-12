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

//@skip
// This tests takes >4s even in release mode on an M1 MBP, so I'd rather avoid running it on EWS by default.

let giga = 1024 * 1024 * 1024;
let sourceLength = 2 * giga;
let destinationLength = 3 * giga;
let offset = giga;

var source = new Uint8ClampedArray(sourceLength);
for (var i = 0; i < 100; ++i)
    source[i] = i & 0x3F;
for (var i = 0; i < 100; ++i) {
    let index = giga + i;
    source[index] = index & 0x3F
}

var destination = new Int8Array(destinationLength);
destination.set(source, offset);

// Before the offset
let value = destination[42];
if (value !== 0)
    throw "At index " + 42 + ", expected 0 but got " + value;

// After the offset but before INT32_MAX
for (var i = 0; i < 100; ++i) {
    let index = offset + i;
    let value = destination[index];
    let expectedValue = (index - offset) & 0x3F;
    if (value != expectedValue)
        throw "At index " + index + ", expected " + expectedValue + " but got " + value;
}

// After the offset and greater than INT32_MAX
for (var i = 0; i < 100; ++i) {
    let index = offset + giga + i;
    let value = destination[index];
    let expectedValue = (index - offset) & 0x3F;
    if (value != expectedValue)
        throw "At index " + index + ", expected " + expectedValue + " but got " + value;
}
