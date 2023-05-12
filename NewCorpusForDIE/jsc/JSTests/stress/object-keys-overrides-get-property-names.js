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

function test(object)
{
    return Object.keys(object);
}
noInline(test);

{
    let object = new String("Cocoa");
    for (let i = 0; i < 1e3; ++i) {
        let result = test(object);
        shouldBe(result.length, 5);
        shouldBe(result[0], '0');
        shouldBe(result[1], '1');
        shouldBe(result[2], '2');
        shouldBe(result[3], '3');
        shouldBe(result[4], '4');
    }

    object.Cocoa = 42;
    let result = test(object);
    shouldBe(result.length, 6);
    shouldBe(result[0], '0');
    shouldBe(result[1], '1');
    shouldBe(result[2], '2');
    shouldBe(result[3], '3');
    shouldBe(result[4], '4');
    shouldBe(result[5], 'Cocoa');
}

{
    let object = new String("Cocoa");
    for (let i = 0; i < 1e3; ++i) {
        let result = test(object);
        shouldBe(result.length, 5);
        shouldBe(result[0], '0');
        shouldBe(result[1], '1');
        shouldBe(result[2], '2');
        shouldBe(result[3], '3');
        shouldBe(result[4], '4');
    }

    object[8] = 42;
    let result = test(object);
    shouldBe(result.length, 6);
    shouldBe(result[0], '0');
    shouldBe(result[1], '1');
    shouldBe(result[2], '2');
    shouldBe(result[3], '3');
    shouldBe(result[4], '4');
    shouldBe(result[5], '8');
}
