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

// See https://tc39.es/ecma262/#sec-setintegritylevel (step 7.b.ii)

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

var seenDescriptors = {};
var proxy = new Proxy({
    foo: 1,
    get bar() {},
    set bar(_v) {},
}, {
    defineProperty: function(target, key, descriptor) {
        seenDescriptors[key] = descriptor;
        return Reflect.defineProperty(target, key, descriptor);
    },
});

Object.freeze(proxy);

shouldBe(seenDescriptors.foo.value, undefined);
shouldBe(seenDescriptors.foo.writable, false);
shouldBe(seenDescriptors.foo.enumerable, undefined);
shouldBe(seenDescriptors.foo.configurable, false);

shouldBe(seenDescriptors.bar.get, undefined);
shouldBe(seenDescriptors.bar.set, undefined);
shouldBe(seenDescriptors.bar.enumerable, undefined);
shouldBe(seenDescriptors.bar.configurable, false);
