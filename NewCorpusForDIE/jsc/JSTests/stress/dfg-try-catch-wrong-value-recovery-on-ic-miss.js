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
        throw new Error("bad value")
}
noInline(assert);

let oThrow = {
    x: 20,
    y: 40,
    z: 50,
    get f() { throw new Error("Hello World!"); }
};

let o1 = {
    x: 20,
    f: 40
};

let o2 = {
    x: 20,
    y: 50,
    f: 500,
    get f() { return 20; }
};

function foo(f) {
    let o = f();
    try {
        o = o.f;
    } catch(e) {
        assert(o === oThrow); // Make sure this is not undefined.
    }
}
noInline(foo);

let i;
let flag = false;
function f() {
    if (flag)
        return oThrow;
    if (i % 2)
        return o1;
    return o2;
}
noInline(f);
for (i = 0; i < 10000; i++) {
    foo(f);
}
flag = true;
foo(f);
