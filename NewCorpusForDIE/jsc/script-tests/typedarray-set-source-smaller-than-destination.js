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
"Tests the code path in typedArray.set that may have to do a copy via an intermediate buffer because the source and destination overlap and have different size elements (source is smaller than destination)."
);

function foo_reference(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int32Array(array);
    array2.set(new Uint8Array(array.buffer, 0, n), 1);
    return array2;
}

function foo(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Uint8Array(array.buffer, 0, n), 1);
    return array;
}

function bar_reference(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i + 1] = 42 + i;
    var array2 = new Int32Array(array);
    array2.set(new Uint8Array(array.buffer, (n + 1) * 4 - n), 0);
    return array2;
}

function bar(n) {
    var array = new Int32Array(n + 1);
    for (var i = 0; i < n; ++i)
        array[i + 1] = 42 + i;
    array.set(new Uint8Array(array.buffer, (n + 1) * 4 - n), 0);
    return array;
}

function baz_reference(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int32Array(array);
    array2.set(new Uint8Array(array.buffer, 0, n));
    return array2;
}

function baz(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Uint8Array(array.buffer, 0, n));
    return array;
}

function fuz_reference(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int32Array(array);
    array2.set(new Uint8Array(array.buffer, n * 4 - n));
    return array2;
}

function fuz(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Uint8Array(array.buffer, n * 4 - n));
    return array;
}

function thingy_reference(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    var array2 = new Int32Array(array);
    array2.set(new Uint8Array(array.buffer, 4, n));
    return array2;
}

function thingy(n) {
    var array = new Int32Array(n);
    for (var i = 0; i < n; ++i)
        array[i] = 42 + i;
    array.set(new Uint8Array(array.buffer, 4, n));
    return array;
}

shouldBe("foo(10)", "foo_reference(10)");
shouldBe("bar(10)", "bar_reference(10)");
shouldBe("baz(10)", "baz_reference(10)");
shouldBe("fuz(10)", "fuz_reference(10)");
shouldBe("thingy(10)", "thingy_reference(10)");

