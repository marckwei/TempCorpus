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
"This test checks the behavior of the for-of construct."
);


var testArray = [1,2,3,4,5,6]

var i = 0;
for (var value of testArray)
    shouldBe("value", "testArray[" + i++ + "]")

shouldBe("testArray.length", String(i))

var i = 0;
for (var key of testArray.keys())
    shouldBe("key", "" + i++ )

shouldBe("testArray.length", String(i))

var i = 0;
for (this.prop1 of testArray.keys())
    shouldBe("this.prop1", "" + i++ )

shouldBe("testArray.length", String(i))

var i = 0;
var prop2 = "asdf"
for (this[prop2] of testArray.keys())
    shouldBe("this[prop2]", "" + i++ )

shouldBe("testArray.length", String(i))


var i = 0;
for (var [key, value] of testArray.entries()) {
    shouldBe("key", "" + i++)
    shouldBe("value", "" + i)
}

shouldBe("testArray.length", String(i))

var i = 0;
for (var [key, value] of testArray.entries()) {
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


var i = 0;
for ([key, value] of testArray.entries()) {
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

