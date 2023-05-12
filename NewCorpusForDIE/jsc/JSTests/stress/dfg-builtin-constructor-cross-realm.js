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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}
noInline(shouldBe);

const {
    Array: OtherArray,
    String: OtherString,
    Object: OtherObject,
    Int8Array: OtherInt8Array,
} = createGlobalObject();

function newArray() { return new OtherArray(4); }
noInline(newArray);

function newString() { return new OtherString("foo"); }
noInline(newString);

function newObject() { return new OtherObject(); }
noInline(newObject);

function newInt8Array() { return new OtherInt8Array(4); }
noInline(newInt8Array);

(function() {
    for (let i = 0; i < 1e5; i++) {
        shouldBe(newArray().constructor, OtherArray);
        shouldBe(newString().constructor, OtherString);
        shouldBe(newObject().constructor, OtherObject);
        shouldBe(newInt8Array().constructor, OtherInt8Array);
    }
})();
