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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var array = new BigInt64Array(new SharedArrayBuffer(8 * 8));
shouldBe(array.length, 8);

function test(array) {
    shouldBe(Atomics.add(array, 0, 8n), 0n);
    shouldBe(array[0], 8n);
    shouldBe(Atomics.sub(array, 0, 1n), 8n);
    shouldBe(array[0], 7n);
    shouldBe(Atomics.and(array, 0, 0b11110n), 7n);
    shouldBe(array[0], 6n);
    shouldBe(Atomics.compareExchange(array, 0, 5n, 0n), 6n);
    shouldBe(array[0], 6n);
    shouldBe(Atomics.compareExchange(array, 0, 6n, 1n), 6n);
    shouldBe(array[0], 1n);
    shouldBe(Atomics.exchange(array, 0, 2n), 1n);
    shouldBe(array[0], 2n);
    shouldBe(Atomics.load(array, 0), 2n);
    shouldBe(Atomics.or(array, 0, 1n), 2n);
    shouldBe(array[0], 3n);
    shouldBe(Atomics.store(array, 0, 6n), 6n);
    shouldBe(array[0], 6n);
    shouldBe(Atomics.xor(array, 0, 0b11111n), 6n);
    shouldBe(array[0], 25n);
    shouldBe(Atomics.store(array, 0, 0n), 0n);
}
noInline(array);

for (var i = 0; i < 1e4; ++i)
    test(array);
