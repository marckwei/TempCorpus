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

//@ skip if $model =~ /^Apple Watch/
function assert(b) {
    if (!b)
        throw new Error;
}
noInline(assert)

function getZ(o) {
    return o.z
}
noInline(getZ)

function C() {
    this.x = 42;
}

let objs = [];
for (let i = 0; i < 50; ++i) {
    objs.push(new C);
}

function doTest(zVal) {
    for (let i = 0; i < objs.length; ++i) {
        let o = objs[i];
        assert(o.x === 42);
        assert(getZ(o) === zVal)
    }
}
noInline(doTest);

for (let i = 0; i < 10000; ++i) {
    const X = { i }
    C.prototype.z = X
    doTest(X)
}

delete C.prototype.z

for (let i = 0; i < 20000; ++i) {
    getZ({z: i})
    doTest(undefined)
}

