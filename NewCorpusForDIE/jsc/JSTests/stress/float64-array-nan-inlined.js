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

//@ defaultRun
//@ runNoJIT

function foo(o) {
    return o[0];
}

function isBigEndian() {
    var word = new Int16Array(1);
    word[0] = 1;
    var bytes = new Int8Array(word.buffer);
    return !bytes[0];
}

function test(a, b, x) {
    var intArray = new Int32Array(2);
    intArray[0] = a;
    intArray[1] = b;
    var floatArray = new Float64Array(intArray.buffer);
    var element = foo(floatArray);
    var result = element + 1;
    if (("" + result) != ("" + x))
        throw "Error: bad result for " + a + ", " + b + ": " + result + ", but expected: " + x + "; loaded " + element + " from the array";
}

noInline(test);

for (var i = 0; i < 100000; ++i)
    test(0, 0, 1);

if (isBigEndian()) {
    test(0xFFFF0000, 0, 0/0);
    test(0, 0xFFFF0000, 1);
} else {
    test(0xFFFF0000, 0, 1);
    test(0, 0xFFFF0000, 0/0);
}
