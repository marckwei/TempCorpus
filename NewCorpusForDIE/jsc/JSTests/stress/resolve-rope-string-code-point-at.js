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

var hello0 = "Hello"; // Ensure that "Hello" is registered in AtomStringTable.
var hello1 = createNonRopeNonAtomString("Hello");

function test(string)
{
    var result = [0, 0, 0, 0];
    var object = { };
    for (var i = 0; i < 10000; ++i) {
        var index = i % 4;
        result[index] = string.codePointAt(index);
        if (i === 5000) {
            // Enforce JSValue::toPropertyKey. After this, string is atomic.
            object[string];
        }
    }
    return result;
}
noInline(test);

for (var i = 0; i < 1000; ++i) {
    var newString = createNonRopeNonAtomString("Hello");
    var result = test(newString)
    shouldBe(result[0], 72);
    shouldBe(result[1], 101);
    shouldBe(result[2], 108);
    shouldBe(result[3], 108);
}
