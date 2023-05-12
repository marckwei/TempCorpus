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
        throw new Error("Bad")
}
noInline(assert);

function test(f, v, c, d) {
    return f.bind(v, c, d);
}
noInline(test);

function test2(f, v) {
    return f.bind(v);
}
noInline(test);

function foo(a,b,c,d,e,f) { return this; }
let thisValue = {};
let start = Date.now();
for (let i = 0; i < 1000000; i++) {
    let f = test(foo, thisValue, 20, 30);
    assert(f(foo, thisValue, 20, 30) === thisValue);
}
for (let i = 0; i < 1000000; i++) {
    let f = test2(foo, thisValue);
    assert(f(foo, thisValue, 20, 30) === thisValue);
}
const verbose = false;
if (verbose)
    print(Date.now() - start);
