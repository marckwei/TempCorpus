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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function test(array, val1)
{
    return array.push(val1);
}
noInline(test);

for (var i = 0; i < 1e5; ++i) {
    var array = ["Cocoa"];
    ensureArrayStorage(array);
    shouldBe(test(array, "Cocoa"), 2);
    shouldBe(array[0], "Cocoa");
    shouldBe(array[1], "Cocoa");
    shouldBe(array[2], undefined);
    shouldBe(array[3], undefined);
    shouldBe(array[4], undefined);
    shouldBe(test(array, "Cappuccino"), 3);
    shouldBe(array[0], "Cocoa");
    shouldBe(array[1], "Cocoa");
    shouldBe(array[2], "Cappuccino");
    shouldBe(array[3], undefined);
    shouldBe(array[4], undefined);
    shouldBe(test(array, "Matcha"), 4);
    shouldBe(array[0], "Cocoa");
    shouldBe(array[1], "Cocoa");
    shouldBe(array[2], "Cappuccino");
    shouldBe(array[3], "Matcha");
    shouldBe(array[4], undefined);
    shouldBe(test(array, "Matcha"), 5);
    shouldBe(array[0], "Cocoa");
    shouldBe(array[1], "Cocoa");
    shouldBe(array[2], "Cappuccino");
    shouldBe(array[3], "Matcha");
    shouldBe(array[4], "Matcha");
}
