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

let v = 10n;
assert(v.toString() === "10");
assert(v.toString(2) === "1010");
assert(v.toString(3) === "101");
assert(v.toString(8) === "12");
assert(v.toString(16) === "a");
assert(v.toString(32) === "a");

v = 191561942608236107294793378393788647952342390272950271n;
assert(v.toString() === "191561942608236107294793378393788647952342390272950271");
assert(v.toString(2) === "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111");
assert(v.toString(3) === "2002122121011101220102010210020102000210011100122221002112102021022221102202020101221000021200201121121100121121");
assert(v.toString(8) === "77777777777777777777777777777777777777777777777777777777777");
assert(v.toString(16) === "1ffffffffffffffffffffffffffffffffffffffffffff");
assert(v.toString(32) === "3vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");

v = -10n;
assert(v.toString() === "-10");
assert(v.toString(2) === "-1010");
assert(v.toString(3) === "-101");
assert(v.toString(8) === "-12");
assert(v.toString(16) === "-a");
assert(v.toString(32) === "-a");

v = -191561942608236107294793378393788647952342390272950271n;
assert(v.toString() === "-191561942608236107294793378393788647952342390272950271");
assert(v.toString(2) === "-111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111");
assert(v.toString(3) === "-2002122121011101220102010210020102000210011100122221002112102021022221102202020101221000021200201121121100121121");
assert(v.toString(8) === "-77777777777777777777777777777777777777777777777777777777777");
assert(v.toString(16) === "-1ffffffffffffffffffffffffffffffffffffffffffff");
assert(v.toString(32) === "-3vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");

// Invaid radix

function testInvalidRadix(radix) {
    try {
        v.toString(radix);
        assert(false);
    } catch(e) {
        assert(e instanceof RangeError);
    }
}

testInvalidRadix(-10);
testInvalidRadix(-1);
testInvalidRadix(0);
testInvalidRadix(1);
testInvalidRadix(37);
testInvalidRadix(4294967312);

