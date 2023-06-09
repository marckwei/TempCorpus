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
"This test checks the behavior of the iterator methods on Array objects."
);

shouldBeTrue("'values' in []");

var testArray = [1,2,3,4,5,6]
var values = testArray.values();
var i = 0;
for (var value of values) {
    shouldBe("value", "testArray[i]")
    i++
    shouldBe("value", String(i))
}

shouldBe("testArray.length", String(i))

var testArray = [1,2,3,4,5,6]
var values = testArray.values();
var i = 0;
for (var value of values) {
    shouldBe("value", "testArray[i]")
    i++
    if (i % 2 == 0)
        testArray[i] *= 2;
    if (i < 4)
        testArray.push(testArray.length)
    if (i == 4)
        delete testArray[4]
    if (i == 5)
        testArray[4] = 5
}
shouldBe("testArray.length", String(i))

var o = {};
for (var i =0; i < 6; i++)
    o[i]=i+1


var values = Array.prototype.values.call(o);
var i = 0;
for (var value of values) {
    fail();
}
shouldBe("i", "0")

o.length=6;

var values = Array.prototype.values.call(o);
var i = 0;
for (var value of values) {
    shouldBe("value", "o[i]")
    i++
    shouldBe("value", String(i))
}
shouldBe("o.length", String(i))

var testArray = [1,2,3,4,5,6]
var keys = testArray.keys();
var i = 0;
for (var key of keys) {
    shouldBe("key", String(i))
    i++;
}

shouldBe("testArray.length", String(i))

var entries = testArray.entries();
var i = 0;
for (var [key, value] of entries) {
    shouldBe("value", "testArray[key]")
    shouldBe("key", String(i))
    i++
    shouldBe("value", String(i))
}

shouldBe("testArray.length", String(i))

var entries = testArray.entries();
var i = 0;
for (var [key, value] of entries) {
    shouldBe("value", "testArray[key]")
    shouldBe("key", "i")
    i++
    if (i % 2 == 0)
        testArray[i] *= 2;
    if (i < 4)
        testArray.push(testArray.length)
    if (i == 4)
        delete testArray[4]
    if (i == 5)
        testArray[4] = 5
}
shouldBe("testArray.length", String(i))

var o = {};
for (var i =0; i < 6; i++)
    o[i]=i+1


var entries = Array.prototype.entries.call(o);
var i = 0;
for (var [key, value] of entries) {
    fail();
}
shouldBe("i", "0")

o.length=6;

var entries = Array.prototype.entries.call(o);
var i = 0;
for (var [key, value] of entries) {
    shouldBe("value", "o[key]")
    shouldBe("key", String(i))
    i++
    shouldBe("value", String(i))
}
shouldBe("o.length", String(i))


var testArray = [1.5,2.5,3.5,4.5,5.5,6.5]
var i = 0;
for (var value of testArray) {
    shouldBe("value", String(i + 1.5))
    i++;
}

shouldBe("testArray.length", String(i))


var testArray = [true,true,true,true,true,true]
var i = 0;
for (var value of testArray) {
    shouldBe("value", "true")
    i++;
}

shouldBe("testArray.length", String(i))


var testArray = [NaN,NaN,NaN,NaN,NaN,NaN]
var i = 0;
for (var value of testArray) {
    shouldBeTrue("isNaN(value)")
    i++;
}

shouldBe("testArray.length", String(i))



var testArray = [undefined,,undefined,,undefined,undefined]
testArray.length = 8;
var i = 0;
for (var value of testArray) {
    shouldBeUndefined("value")
    i++;
}

shouldBe("testArray.length", String(i))
var i = 0;
for (var key of testArray.keys()) {
    shouldBe("key", String(i))
    i++;
}

shouldBe("testArray.length", String(i))
