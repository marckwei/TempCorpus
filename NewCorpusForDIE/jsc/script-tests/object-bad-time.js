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
"Tests that defining a setter on the prototype of an object used for indexed storage works even if it is done after objects with indexed storage are allocated."
);

function Cons() {
}

var ouches = 0;

function foo(haveABadTime) {
    var result = new Cons();
    result.length = 5;
    for (var i = 0; i < result.length; ++i) {
        if (i == haveABadTime) {
            debug("Henceforth I will have a bad time.");
            Cons.prototype.__defineSetter__("3", function() { debug("Ouch!"); ouches++; });
        }
        result[i] = i;
    }
    return result;
}

var expected = "\"0,1,2,3,4\"";

for (var i = 0; i < 1000; ++i) {
    var haveABadTime;
    if (i == 950) {
        haveABadTime = 2;
        expected = "\"0,1,2,,4\"";
    } else
        haveABadTime = -1;
    shouldBe("\"" + Array.prototype.join.apply(foo(haveABadTime), [","]) + "\"", expected);
}

shouldBe("ouches", "50");
