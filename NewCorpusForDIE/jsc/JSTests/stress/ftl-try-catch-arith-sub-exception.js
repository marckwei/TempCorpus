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
        throw new Error("uh oh");
}

let flag = false;
let o = {
    valueOf() {
        if (flag)
            throw new Error("by by");
        return 13.5;
    }
};
noInline(o.valueOf);

function baz() { return 1.5; }
noInline(baz);

function foo(x, o) {
    let r = baz();
    try {
        r = x - o - r;
    } catch(e) { }
    return r;
}
noInline(foo);

let x = 20.5;
for (let i = 0; i < 10000; i++) {
    assert(foo(x, o) === 5.5);
}
flag = true;
assert(foo(x, o) === 1.5);


function bar(x, o) {
    let caughtException = false;
    var r = null;
    try {
        // This tests aliasing of left/right with result register in a SubGenerator
        // and ensures that the sub will spill the register properly and that we value
        // recover properly.
        r = x - o;
    } catch(e) {
        caughtException = true;
        assert(r === null);
    }
    if (!caughtException)
        assert(r === 7);
    return caughtException;
} 
noInline(bar);

flag = false;
for (let i = 0; i < 10000; i++) {
    assert(bar(x, o) === false);
}
flag = true;
assert(bar(x, o) === true);
