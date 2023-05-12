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

function foo(o, a) {
    let x = o.g;
    let y = o.y;
    try {
        o.f = 20;
    } catch(e) {
        return x + y + 1;
    }
    return x + y;
}

function assert(b) {
    if (!b)
        throw new Error("bad value")
}
noInline(assert);

noInline(foo);
var flag = false;
function f(arg1, arg2, arg3) {
    if (flag)
        throw new Error("blah")
    return arg1;
}
noInline(f);
let o1 = {
    g: 20,
    y: 40,
    f: null
};

let o2 = {
    g: "g",
    y: "y",
    set f(v) { if (flag) throw new Error("blah"); }
}

for (let i = 0; i < 100000; i++) {
    if (i % 2) {
        assert(foo(o1) === 60);
    } else {
        assert(foo(o2) === "gy");
    }
}
flag = true;
assert(foo(o2) === "gy1");
