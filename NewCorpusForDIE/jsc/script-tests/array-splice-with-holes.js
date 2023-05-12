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

description("Test to ensure correct behaviour of Array.prototype.splice when the array has holes in it.");

var actualArray = new Array(20);
var seedArray = ["Black","White","Blue","Red","Green","Orange","Purple","Cyan","Yellow"];
for (var i = 0; i < seedArray.length; i++)
    actualArray[i] = seedArray[i];
actualArray.splice(3, 1);
var expectedSeedArray = ["Black","White","Blue","Green","Orange","Purple","Cyan","Yellow"];
var expectedArray = new Array(19);
for (var i = 0; i < expectedSeedArray.length; i++)
    expectedArray[i] = expectedSeedArray[i];

shouldBe("actualArray.toString()", "expectedArray.toString()");
shouldBe("actualArray.length", "expectedArray.length");

actualArray = new Array(20);
for (var i = 0; i < seedArray.length; i += 2)
    actualArray[i] = seedArray[i];
actualArray.splice(2, 2);
var expectedArray = new Array(18);
expectedArray[0] = "Black";
expectedArray[2] = "Green";
expectedArray[4] = "Purple";
expectedArray[6] = "Yellow";

shouldBe("actualArray.toString()", "expectedArray.toString()");
shouldBe("actualArray.length", "expectedArray.length");
