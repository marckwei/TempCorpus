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

description("Regresion test for 155776. This test should pass and not crash.");

var bigArray = [];
var bigNum = 123456789;
var smallNum = 123;
var toStringCount = 0;

function fillBigArrayViaToString(n) {
    var results = [];

    for (var i = 0; i < n; i++)
        fillBigArrayViaToString.toString();

    return results;
}

Function.prototype.toString = function(x) {
    toStringCount++;
    bigArray.push(smallNum);

    if (toStringCount == 2000) {
        var newArray = new Uint32Array(8000);
        for (var i = 0; i < newArray.length; i++)
            newArray[i] = 0x10000000;
    }

    bigArray.push(fillBigArrayViaToString);
    bigArray.push(fillBigArrayViaToString);
    bigArray.push(fillBigArrayViaToString);
    return bigNum;
};

fillBigArrayViaToString(4000).join();

bigArray.length = 4000;

var stringResult = bigArray.join(":");

var expectedArray = [];

for (var i = 0; i < 1000; i++) {
    expectedArray.push(smallNum);
    expectedArray.push(bigNum);
    expectedArray.push(bigNum);
    expectedArray.push(bigNum);
}

var expectedString = expectedArray.join(":");

shouldBe('stringResult', 'expectedString');
