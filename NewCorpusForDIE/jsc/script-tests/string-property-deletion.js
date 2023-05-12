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

description("This page tests deletion of properties on a string object.");

var str = "abc";
shouldBe('str.length', '3');
shouldBe('delete str.length', 'false');
shouldBe('delete str[0]', 'false');
shouldBe('delete str[1]', 'false');
shouldBe('delete str[2]', 'false');
shouldBe('delete str[3]', 'true');
shouldBe('delete str[-1]', 'true');
shouldBe('delete str[4294967294]', 'true');
shouldBe('delete str[4294967295]', 'true');
shouldBe('delete str[4294967296]', 'true');
shouldBe('delete str[0.0]', 'false');
shouldBe('delete str[0.1]', 'true');
shouldBe('delete str[\'0.0\']', 'true');
shouldBe('delete str.foo', 'true');
