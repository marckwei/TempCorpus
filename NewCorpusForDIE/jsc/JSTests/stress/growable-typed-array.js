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

//@ requireOptions("--useResizableArrayBuffer=1")

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldThrow(func, errorMessage) {
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
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

{
    let buffer = new SharedArrayBuffer(42, { maxByteLength: 1024 });
    let array = new Int8Array(buffer);
    shouldBe(array.length, 42);
    shouldBe(array.byteLength, 42);
    buffer.grow(128);
    shouldBe(array.length, 128);
    shouldBe(array.byteLength, 128);
    buffer.grow(1024);
    shouldBe(array.length, 1024);
    shouldBe(array.byteLength, 1024);
}

{
    let buffer = new SharedArrayBuffer(42, { maxByteLength: 1024 });
    let view = new DataView(buffer);
    shouldBe(view.byteLength, 42);
    buffer.grow(128);
    shouldBe(view.byteLength, 128);
    buffer.grow(1024);
    shouldBe(view.byteLength, 1024);
}

{
    let buffer = new SharedArrayBuffer(42, { maxByteLength: 1024 });
    shouldThrow(() => {
        let array = new Int8Array(buffer, 128);
    }, `RangeError: byteOffset exceeds source ArrayBuffer byteLength`);
    let array = new Int8Array(buffer, 16);
    shouldBe(array.length, 26);
    shouldBe(array.byteLength, 26);
    buffer.grow(128);
    shouldBe(array.length, 112);
    shouldBe(array.byteLength, 112);
    buffer.grow(1024);
    shouldBe(array.length, 1008);
    shouldBe(array.byteLength, 1008);
}

{
    let buffer = new SharedArrayBuffer(42, { maxByteLength: 1024 });
    shouldThrow(() => {
        let view = new DataView(buffer, 128);
    }, `RangeError: byteOffset exceeds source ArrayBuffer byteLength`);
    let view = new DataView(buffer, 16);
    shouldBe(view.byteLength, 26);
    buffer.grow(128);
    shouldBe(view.byteLength, 112);
    buffer.grow(1024);
    shouldBe(view.byteLength, 1008);
}
