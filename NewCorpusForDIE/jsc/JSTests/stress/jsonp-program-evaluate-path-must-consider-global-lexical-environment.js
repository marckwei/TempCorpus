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
        throw new Error("Bad");
}

disableRichSourceInfo(); // This is needed for the JSONP path to be taken for calls.

let a = 22;
loadString("a = 42");
assert(a === 42);

let b = {f: 22};
loadString("b.f = 42");
assert(b.f === 42);

let c = [1,2,3];
loadString("c[0] = 42;");
assert(c[0] === 42);

let d = {
    foo: [[1,2,3]]
};
loadString("d.foo[0][0] = 42;");
assert(d.foo[0][0] === 42);

let e = [[[1,2,3]]];
loadString("e[0][0][0] = 42;");
assert(e[0][0][0] === 42);

let foo = null;
let bar = 42;
loadString("foo = 'root'; bar = 5")
assert(foo === "root");
assert(bar === 5);

let called = false;
let func = (a) => {
    assert(a.foo === 20);
    called = true;
};

loadString("func({foo:20})");
assert(called);

called = false;
let o = {
    foo(arg) {
        assert(arg.foo === 20);
        called = true;
    }
};

loadString("o.foo({foo:20})");
assert(called);

var theVar = 20;
loadString("theVar = 42");
assert(theVar === 42);
assert(this.theVar === 42);

called = false;
var varFunc = (a) => {
    assert(a.foo === 20);
    called = true;
};
loadString("varFunc({foo:20})");
assert(called);
