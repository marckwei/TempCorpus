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

// Makes sure we don't use base's tag register on 32-bit when an inline cache fails and jumps to the slow path
// because the slow path depends on the base being present.

var createCustomGetterObject = $vm.createCustomGetterObject;

function assert(b) {
    if (!b)
        throw new Error("baddd");
}
noInline(assert);

let customGetter = createCustomGetterObject();
let otherObj = {
    customGetter: 20
};
function randomFunction() {}
noInline(randomFunction);

function foo(o, c) {
    let baz  = o.customGetter;
    if (c) {
        o = 42;
    }
    let jaz = o.foo;
    let kaz = jaz + "hey";
    let raz = kaz + "hey";
    let result = o.customGetter;
    randomFunction(!c, baz, jaz, kaz, raz);
    return result;
}
noInline(foo);

for (let i = 0; i < 10000; i++) {
    switch (i % 2) {
    case 0:
        assert(foo(customGetter) === 100);
        break;
    case 1:
        assert(foo(otherObj) === 20);
        break;
    }
}
assert(foo({hello: 20, world:50, customGetter: 40}) === 40); // Make sure we don't trample registers in "o.customGetter" inline cache failure in foo.
