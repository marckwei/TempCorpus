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
"Tests the code path of typedArray.set that tries to do a memmove-with-conversion for overlapping arrays."
);

function foo(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Uint32Array(array.buffer, 0, n), 1);
    return array;
}

function bar(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i + 1] = 42 + i;
    array.set(new Uint32Array(array.buffer, 4), 0);
    return array;
}

shouldBe("foo(10)", "[42,42,43,44,45,46,47,48,49,50,51]");
shouldBe("bar(10)", "[42,43,44,45,46,47,48,49,50,51,51]");

