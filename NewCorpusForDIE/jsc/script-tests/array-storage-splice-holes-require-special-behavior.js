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

description("Test to ensure correct behaviour of splice in array storage mode with indexed properties in the prototype chain.");

// Array storage shift holes require special behavior.
var trickyIndex = 6;
Object.prototype[trickyIndex] = trickyIndex;

var a = new Array(10);
for (var i = 0; i < a.length; ++i) {
    if (i === trickyIndex)
        continue;
    a[i] = i;
}

a.shift(); // Converts to array storage mode.
var startIndex = 3;
a.splice(startIndex, 1);

for (var i = 0; i < startIndex; ++i)
    shouldBe("a[" + i + "]", "" + (i + 1));

for (var i = startIndex; i < a.length; ++i)
    shouldBe("a[" + i + "]", "" + (i + 2));

// Array storage shift holes require special behavior, but there aren't any holes.
var b = new Array(10);
for (var i = 0; i < b.length; ++i)
    b[i] = i;

b.shift(); // Converts to array storage mode.
b.splice(startIndex, 1);

for (var i = 0; i < startIndex; ++i)
    shouldBe("b[" + i + "]", "" + (i + 1));

for (var i = startIndex; i < b.length; ++i)
    shouldBe("b[" + i + "]", "" + (i + 2));
