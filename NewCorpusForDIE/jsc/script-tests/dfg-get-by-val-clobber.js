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

description(
"This tests that common subexpression elimination knows how to accurately model PutBuVal."
);

function doAccesses(a, b, i, j, y) {
    var x = a[i];
    b[j] = y;
    return a[i];
}

var array1 = [1, 2, 3, 4];
var array2 = [5, 6, 7, 8];

for (var i = 0; i < 1000; ++i) {
    // Simple test, pretty easy to pass.
    shouldBe("doAccesses(array1, array2, i % 4, (i + 1) % 4, i)", "" + ((i % 4) + 1));
    shouldBe("array2[" + ((i + 1) % 4) + "]", "" + i);
    
    // Undo.
    array2[((i + 1) % 4)] = (i % 4) + 5;
    
    // Now the evil test. This is constructed to minimize the likelihood that CSE will succeed through
    // cleverness alone.
    shouldBe("doAccesses(array1, array1, i % 4, 0, i)", "" + ((i % 4) == 0 ? i : (i % 4) + 1));
    
    // Undo.
    array1[0] = 1;
}

