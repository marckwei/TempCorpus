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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}

function assertLengthDescriptorAttributes(ctor, lengthValue) {
    let descriptor = Object.getOwnPropertyDescriptor(ctor, "length");

    assert(descriptor.value === lengthValue);
    assert(!descriptor.enumerable);
    assert(!descriptor.writable);
    assert(descriptor.configurable);
}

assertLengthDescriptorAttributes(Array, 1);
assertLengthDescriptorAttributes(ArrayBuffer, 1);
assertLengthDescriptorAttributes(Boolean, 1);
assertLengthDescriptorAttributes(DataView, 1);
assertLengthDescriptorAttributes(Date, 7);
assertLengthDescriptorAttributes(Error, 1);
assertLengthDescriptorAttributes(Function, 1);
assertLengthDescriptorAttributes(Map, 0);
assertLengthDescriptorAttributes(Number, 1);
assertLengthDescriptorAttributes(Object, 1);
assertLengthDescriptorAttributes(Promise, 1);
assertLengthDescriptorAttributes(Proxy, 2);
assertLengthDescriptorAttributes(RegExp, 2);
assertLengthDescriptorAttributes(Set, 0);
assertLengthDescriptorAttributes(String, 1);
assertLengthDescriptorAttributes(Symbol, 0);
assertLengthDescriptorAttributes(WeakMap, 0);
assertLengthDescriptorAttributes(WeakSet, 0);

assertLengthDescriptorAttributes(Int8Array, 3);
assertLengthDescriptorAttributes(Uint8Array, 3);
assertLengthDescriptorAttributes(Int16Array, 3);
assertLengthDescriptorAttributes(Uint16Array, 3);
assertLengthDescriptorAttributes(Int32Array, 3);
assertLengthDescriptorAttributes(Uint32Array, 3);
assertLengthDescriptorAttributes(Float32Array, 3);
assertLengthDescriptorAttributes(Float64Array, 3);
