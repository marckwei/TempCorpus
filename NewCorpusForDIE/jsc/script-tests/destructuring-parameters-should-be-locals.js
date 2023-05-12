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

description("This tests to ensure that destructuring parameters behave like regular locals")

var value="outer"
function readDestructuredParameter([value]) {
    return value;
}

function overwriteDestructuredParameter([value]) {
	value = "inner"
}

function readCapturedDestructuredParameter([value]) {
	return (function () {
	    return value;
	})()
}

function overwriteCapturedDestructuredParameter([value]) {
	(function () {
	    value = "innermost";
	})()
	return value
}

shouldBe("readDestructuredParameter(['inner'])", "'inner'")
overwriteDestructuredParameter(['inner'])

shouldBe("overwriteDestructuredParameter(['unused']); value;", "'outer'")

shouldBe("readCapturedDestructuredParameter(['inner'])", "'inner'")
overwriteDestructuredParameter(['inner'])

shouldBe("overwriteCapturedDestructuredParameter(['unused']);", "'innermost'")
shouldBe("value", "'outer'")

