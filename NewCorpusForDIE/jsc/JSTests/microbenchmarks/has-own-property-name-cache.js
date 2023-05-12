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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
let objs = [
    {
        __proto__: { 
            foo: 25
        },
        bar: 50,
        baz: 75,
        jaz: 80,
    },
    {
        __proto__: { 
            bar: 25
        },
        baz: 75,
        kaz: 80,
        bar: 50,
        jaz: 80,
    },
    {
        __proto__: { 
            bar: 25,
            jaz: 50
        },
        bar: 50,
        baz: 75,
        kaz: 80,
        jaz: 80,
        foo: 55
    }
];

function foo(o) {
    for (let p in o)
        o.hasOwnProperty(p);

}
noInline(foo);

let start = Date.now();
for (let i = 0; i < 1000000; ++i) {
    foo(objs[i % objs.length]);
}
const verbose = false;
if (verbose)
    print(Date.now() - start);
