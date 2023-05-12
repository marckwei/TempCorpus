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
"Tests the code path in typedArray.set that may have to do a copy via an intermediate buffer because the source and destination overlap and have different size elements (source is larger than destination)."
);

function foo_reference(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int8Array(array);
    array2.set(new Int32Array(array.buffer));
    return array2;
}

function foo(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Int32Array(array.buffer));
    return array;
}

function bar_reference(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int8Array(array);
    array2.set(new Int32Array(array.buffer), n - n / 4);
    return array2;
}

function bar(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Int32Array(array.buffer), n - n / 4);
    return array;
}

function baz_reference(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int8Array(array);
    array2.set(new Int32Array(array.buffer), n / 2 - (n / 4) / 2);
    return array2;
}

function baz(n) {
    var array = new Int8Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Int32Array(array.buffer), n / 2 - (n / 4) / 2);
    return array;
}

shouldBe("foo(64)", "foo_reference(64)");
shouldBe("bar(64)", "bar_reference(64)");
shouldBe("baz(64)", "baz_reference(64)");
