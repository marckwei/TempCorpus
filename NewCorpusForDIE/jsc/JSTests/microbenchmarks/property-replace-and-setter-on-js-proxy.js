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

//@ requireOptions("--exposeCustomSettersOnGlobalObjectForTesting=true")

function assert(b) {
    if (!b)
        throw new Error;
}

let global = this;
Object.defineProperty(global, "Y", {
    set: function(v) {
        assert(this === global);
        assert(v === i + 1);
        this._Y = v;
    }
});

function foo(x, y, z, a) {
    this.X = x;
    this.Y = y;
    this.testCustomAccessorSetter = z;
    this.testCustomValueSetter = a;
}
noInline(foo);

let i;
for (i = 0; i < 1000000; ++i) {
    foo(i, i + 1, i + 2, i + 3);
    assert(global.X === i);
    assert(global._Y === i + 1);
    assert(global._testCustomAccessorSetter === i + 2);
    assert(global._testCustomValueSetter === i + 3);
}
