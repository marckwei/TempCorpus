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
    if (!b) throw new Error("bad value");
}
noInline(assert);

let i;
var o1 = { 
    get f() {
        if (i === -1000)
            throw new Error("hello");
        return 20;
    },
    x: "x"
};

var o2 = {
    f: 40
}

var o3 = {
    x: 100,
    f: "f"
}

function bar(i) {
    if (i === -1000)
        return o1;

    if (i % 2)
        return o3;
    else
        return o2;
}
noInline(bar);

function foo(i) {
    var o = bar(i);
    let v;
    let v2;
    let v3;
    try {
        v2 = o.x;
        v = o.f;
    } catch(e) {
        assert(v2 === "x");
        assert(o === o1);
    }
}
noInline(foo);

foo(i);
for (i = 0; i < 1000; i++)
    foo(i);

i = -1000;
for (let j = 0; j < 1000; j++)
    foo(i);
