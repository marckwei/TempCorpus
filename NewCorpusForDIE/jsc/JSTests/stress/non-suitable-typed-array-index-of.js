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

{
    let array = new Uint8Array([0, 1, 2, 3, 0xff]);
    shouldBe(array.indexOf(-1), -1);
    shouldBe(array.indexOf(0xff), 4);
    shouldBe(array.indexOf(0xffff), -1);
    shouldBe(array.includes(-1), false);
    shouldBe(array.includes(0xff), true);
    shouldBe(array.includes(0xffff), false);
}
{
    let array = new Uint8ClampedArray([0, 1, 2, 3, 0xff]);
    shouldBe(array.indexOf(-1), -1);
    shouldBe(array.indexOf(0xff), 4);
    shouldBe(array.indexOf(0xffff), -1);
    shouldBe(array.includes(-1), false);
    shouldBe(array.includes(0xff), true);
    shouldBe(array.includes(0xffff), false);
}
{
    let array = new Int8Array([0, 1, 2, 3, -1]);
    shouldBe(array.indexOf(-1), 4);
    shouldBe(array.indexOf(0xff), -1);
    shouldBe(array.indexOf(0xffff), -1);
    shouldBe(array.includes(-1), true);
    shouldBe(array.includes(0xff), false);
    shouldBe(array.includes(0xffff), false);
}
