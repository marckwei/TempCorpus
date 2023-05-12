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

function hasSyntaxError(f) {
    let threw = false;
    try {
        f();
    } catch(e) {
        threw = e instanceof SyntaxError;
    }
    return threw;
}

let functions = [
    Function,
    (function*foo(){}).__proto__.constructor,
    (async function foo(){}).__proto__.constructor,
];

function testError(...args) {
    for (let f of functions) {
        assert(hasSyntaxError(() => (f(...args))));
    }
}

function testOK(...args) {
    for (let f of functions) {
        assert(!hasSyntaxError(() => (f(...args))));
    }
}

testError("a", "b", "/*", "");
testError("/*", "*/){");
testError("a=super()", "body;");
testError("a=super.foo", "body;");
testError("super();");
testError("super.foo;");
testError("a", "b", "/*", "");
testError("a", "'use strict'; let a;");
testError("/*", "*/");
testError("/*", "*/");
testError("a=20", "'use strict';");
testError("{a}", "'use strict';");
testError("...args", "'use strict';");
testError("...args", "b", "");
testError("//", "b", "");

testOK("/*", "*/", "");
testOK("a", "/*b", "*/", "'use strict'; let b");
testOK("{a}", "return a;");
testOK("a", "...args", "");
testOK("");
testOK("let a");
testOK(undefined);
testOK("//");

let str = "";
testOK({toString() { str += "1"; return "a"}}, {toString() { str += "2"; return "b"}}, {toString() { str += "3"; return "body;"}});
let target = "";
for (let i = 0; i < functions.length; ++i)
    target += "123";
assert(str === target);
