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

description("Tests basic correctness of ES Map's clear() API");

// Map containing only String types.
var stringMap = new Map;
stringMap.set('Oliver', 'Hunt');
stringMap.set('Benjamin', 'Poulain');

stringMap.clear();
shouldBe("stringMap.size", "0");
shouldBe("stringMap.values.length", "0");
shouldBeFalse("stringMap.has('Oliver')");
shouldBeFalse("stringMap.has('Benjamin')");

// Map containing only primitive values.
var valueMap = new Map;
valueMap.set(0, 1);
valueMap.set(1, 2);

valueMap.clear();
shouldBe("valueMap.size", "0");
shouldBe("valueMap.values.length", "0");
shouldBeFalse("valueMap.has(0)");
shouldBeFalse("valueMap.has(1)");

// Map containing objects;
var objectMap = new Map;
var anArray = new Array;
objectMap.set(anArray, 0);
var anObject = new Object;
objectMap.set(anObject, 1);
var otherObject = {"a":1, "b":2};
objectMap.set(otherObject, 2);

objectMap.clear();
shouldBe("objectMap.size", "0");
shouldBe("objectMap.values.length", "0");
shouldBeFalse("objectMap.has(anArray)");
shouldBeFalse("objectMap.has(anObject)");
shouldBeFalse("objectMap.has(otherObject)");

// Mixed types.
var mixedTypeMap = new Map;
mixedTypeMap.set(0, objectMap);
mixedTypeMap.set('Oliver', stringMap);
mixedTypeMap.set(stringMap, valueMap);
mixedTypeMap.set(valueMap, anObject);
mixedTypeMap.set(objectMap, objectMap);
mixedTypeMap.set(anObject, stringMap);

mixedTypeMap.clear();
shouldBe("mixedTypeMap.size", "0");
shouldBe("mixedTypeMap.values.length", "0");
shouldBeFalse("mixedTypeMap.has(0)");
shouldBeFalse("mixedTypeMap.has('Oliver')");
shouldBeFalse("mixedTypeMap.has(stringMap)");
shouldBeFalse("mixedTypeMap.has(valueMap)");
shouldBeFalse("mixedTypeMap.has(objectMap)");
shouldBeFalse("mixedTypeMap.has(anObject)");
