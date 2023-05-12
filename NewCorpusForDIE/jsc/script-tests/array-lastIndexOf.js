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
'This test checks lastIndexOf for various values in an array'
);


var testArray = [2, 5, 9, 2];
var lastIndex = 0;

lastIndex = testArray.lastIndexOf(2,-500);
shouldBe('lastIndex', '-1');
lastIndex = testArray.lastIndexOf(9,500);
shouldBe('lastIndex', '2');
lastIndex = testArray.lastIndexOf(2);
shouldBe('lastIndex', '3');
lastIndex = testArray.lastIndexOf(7);
shouldBe('lastIndex', '-1');
lastIndex = testArray.lastIndexOf(2, 3);
shouldBe('lastIndex', '3');
lastIndex = testArray.lastIndexOf(2, 2);
shouldBe('lastIndex', '0');
lastIndex = testArray.lastIndexOf(2, -2);
shouldBe('lastIndex', '0');
lastIndex = testArray.lastIndexOf(2, -1);
shouldBe('lastIndex', '3');

delete testArray[1];

lastIndex = testArray.lastIndexOf(undefined);
shouldBe('lastIndex', '-1');

delete testArray[3];

lastIndex = testArray.lastIndexOf(undefined);
shouldBe('lastIndex', '-1');

testArray = new Array(20);

lastIndex = testArray.lastIndexOf(undefined);
shouldBe('lastIndex', '-1');

testArray[19] = undefined;

lastIndex = testArray.lastIndexOf(undefined);
shouldBe('lastIndex', '19');

lastIndex = testArray.lastIndexOf(undefined, 18);
shouldBe('lastIndex', '-1');

delete testArray[19];

lastIndex = testArray.lastIndexOf(undefined);
shouldBe('lastIndex', '-1');
