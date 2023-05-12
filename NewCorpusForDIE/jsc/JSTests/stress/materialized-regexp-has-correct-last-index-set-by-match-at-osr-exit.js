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

function test(num, string)
{
    var regexp = /hello/g;
    regexp.lastIndex = "Cocoa";
    if (num === 2)
        return regexp.lastIndex;
    var result = string.match(regexp);
    if (num === 1) {
        OSRExit();
        return [result, regexp];
    }
    return regexp.lastIndex;
}
noInline(test);

for (var i = 0; i < 1e5; ++i) {
    var num = i % 3;
    switch (num) {
    case 0:
        shouldBe(test(num, "hellohello"), 0);
        break;
    case 1:
        break;
    case 2:
        shouldBe(test(num, "hellohello"), "Cocoa");
        break;
    }
}

var [result, regexp] = test(1, "hellohello");
shouldBe(regexp instanceof RegExp, true);
shouldBe(regexp.lastIndex, 0);
shouldBe(result.length, 2);
shouldBe(result[0], "hello");
shouldBe(result[1], "hello");
