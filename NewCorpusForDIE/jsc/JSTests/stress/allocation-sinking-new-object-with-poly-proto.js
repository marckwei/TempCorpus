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

function foo() {
    class A {
        constructor() {
        }
    };
    return A;
}
let A = foo();
let B = foo();

function makePolyProto(o) {
    return o.x;
}
noInline(makePolyProto);

for (let i = 0; i < 1000; ++i) {
    makePolyProto(i % 2 ? new A : new B);
}

function bar(b) {
    let o = new A;
    if (b) {
        if (isFinalTier())
            OSRExit();
        return o;
    }
}
noInline(bar);

function baz(b) {
    let o = new A;
    if (b)
        return o;
}
noInline(baz);

for (let i = 0; i < 100000; ++i) {
    let b = i % 10 === 0;
    let r = bar(b);
    if (b) {
        if (r.__proto__ !== A.prototype)
            throw new Error("Bad!");
    }
}

for (let i = 0; i < 100000; ++i) {
    let b = i % 10 === 0;
    let r = baz(b);
    if (b) {
        if (r.__proto__ !== A.prototype)
            throw new Error("Bad!");
    }
}
