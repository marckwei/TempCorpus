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

function assert(cond) {
    if (!cond)
        throw new Error("broke assertion");
}
noInline(assert);

let foo = "foo";
const bar = "bar";

for (let i = 0; i < 1000; i++) {
    assert(foo === "foo");
    assert(bar === "bar");
}

eval("var INJECTION = 20");

for (let i = 0; i < 100; i++) {
    assert(foo === "foo");
    assert(bar === "bar");
    assert(INJECTION === 20);
    let threw = false;
    try {
        eval("var foo;");
    } catch(e) {
        threw = true;
        assert(e.message.indexOf("Can't create duplicate global variable in eval") !== -1);
    }
    assert(threw);
    threw = false;
    try {
        eval("var bar;");
    } catch(e) {
        threw = true;
        assert(e.message.indexOf("Can't create duplicate global variable in eval") !== -1);
    }
    assert(threw);

    assert(foo === "foo");
    assert(bar === "bar");
    assert(INJECTION === 20);
}


var flag = false;
function baz() {
    if (flag) eval("var foo = 20;");
    return foo;
}

for (var i = 0; i < 1000; i++) {
    assert(baz() === "foo");
    assert(baz() === foo);
}
flag = true;
for (var i = 0; i < 1000; i++) {
    assert(baz() === 20);
}
