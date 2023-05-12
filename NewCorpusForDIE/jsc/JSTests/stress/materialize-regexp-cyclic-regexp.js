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

//@ skip if $architecture != "arm64" and $architecture != "x86_64" and $architecture != "arm" and $architecture != "mips"

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function test(num)
{
    var regexp = /hello world/;
    var world = /World/;
    regexp.lastIndex = world;
    world.lastIndex = regexp;
    if (num === 0)
        return regexp;
    if (num === 1)
        return regexp.lastIndex;
    return regexp.lastIndex.lastIndex;
}
noInline(test);

for (var i = 0; i < 1e6; ++i) {
    var num = i % 3;
    switch (num) {
    case 0:
        var regexp = test(num);
        shouldBe(regexp instanceof RegExp, true);
        shouldBe(regexp.toString(), "/hello world/");
        shouldBe(regexp.lastIndex instanceof RegExp, true);
        shouldBe(regexp.lastIndex.toString(), "/World/");
        break;
    case 1:
        var regexp = test(num);
        shouldBe(regexp instanceof RegExp, true);
        shouldBe(regexp.toString(), "/World/");
        shouldBe(regexp.lastIndex instanceof RegExp, true);
        shouldBe(regexp.lastIndex.toString(), "/hello world/");
        break;
    case 2:
        var regexp = test(num);
        shouldBe(regexp instanceof RegExp, true);
        shouldBe(regexp.toString(), "/hello world/");
        shouldBe(regexp.lastIndex instanceof RegExp, true);
        shouldBe(regexp.lastIndex.toString(), "/World/");
        break;
    }
}
