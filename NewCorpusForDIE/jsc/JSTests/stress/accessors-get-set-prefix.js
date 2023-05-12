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

function tryGetOwnPropertyDescriptorGetName(obj, property, expectedName)
{
    let descriptor = Object.getOwnPropertyDescriptor(obj, property);
    if (!descriptor)
        throw "Couldn't find property descriptor on object " + obj.toString() + " for property " + property.toString();

    let getter = descriptor.get;
    if (!getter)
        throw "Property " + property.toString() + " on object " + obj.toString() + " is not a getter";

    let getterName = getter.name;
    if (getterName !== expectedName)
        throw "Wrong getter name for property " + property.toString() + " on object " + obj.toString() + " expected " + expectedName + " got " + getterName;
}

tryGetOwnPropertyDescriptorGetName(Array, Symbol.species, "get [Symbol.species]");
tryGetOwnPropertyDescriptorGetName(Map, Symbol.species, "get [Symbol.species]");
tryGetOwnPropertyDescriptorGetName(Set, Symbol.species, "get [Symbol.species]");
tryGetOwnPropertyDescriptorGetName(RegExp, Symbol.species, "get [Symbol.species]");
tryGetOwnPropertyDescriptorGetName(Promise, Symbol.species, "get [Symbol.species]");
tryGetOwnPropertyDescriptorGetName(Map.prototype, "size", "get size");
tryGetOwnPropertyDescriptorGetName(Set.prototype, "size", "get size");
tryGetOwnPropertyDescriptorGetName(RegExp.prototype, "flags", "get flags");
tryGetOwnPropertyDescriptorGetName(RegExp.prototype, "sticky", "get sticky");
tryGetOwnPropertyDescriptorGetName(RegExp.prototype, "source", "get source");

if (Object.__lookupGetter__("__proto__").name !== "get __proto__")
    throw "Expected Object __proto__ getter to be named \"get __proto\"";

if (Object.__lookupSetter__("__proto__").name !== "set __proto__")
    throw "Expected Object __proto__ setter to be named \"set __proto\"";

if (Int32Array.prototype.__lookupGetter__("byteOffset").name !== "get byteOffset")
    throw "Expected TypedArray.prototype byteOffset getter to be named \"get byteOffset\"";
