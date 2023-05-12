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

var shouldThrow = false;

// str concat generates op_to_primitive.
function toPrimitiveTarget() {
    if (shouldThrow) {
        return Symbol('Cocoa');
    }
    return 'Cocoa';
}
noInline(toPrimitiveTarget);

function doToPrimitive() {
    var value = toPrimitiveTarget();
    return value + "Cappuccino" + value;
}
noInline(doToPrimitive);

for (var i = 0; i < 10000; ++i) {
    var result = doToPrimitive();
    if (result !== "CocoaCappuccinoCocoa")
        throw "Error: bad result: " + result;
}

shouldThrow = true;

var didThrow;
try {
    shouldThrow = true;
    doToPrimitive();
} catch (e) {
    didThrow = e;
}

if (String(didThrow) !== "TypeError: Cannot convert a symbol to a string")
    throw "Error: didn't throw or threw wrong exception: " + didThrow;
