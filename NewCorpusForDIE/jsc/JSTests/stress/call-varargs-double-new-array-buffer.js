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

function assert(b, m = "") {
    if (!b)
        throw new Error("Bad assert: " + m);
}
noInline(assert);

function bar(...args) {
    return args;
}
noInline(bar);

function foo(a, ...args) {
    let x = bar(...args, 42, ...[0.5, 1.5, 2.5, 3.5, 4.5], ...args); 
    return x;
}
noInline(foo);

for (let i = 0; i < 10000; i++) {
    let r = foo(i, i+1, i+2, i+3);
    assert(r.length === 12);
    assert(r[0] === i+1, JSON.stringify(r));
    assert(r[1] === i+2, JSON.stringify(r));
    assert(r[2] === i+3, JSON.stringify(r));
    assert(r[3] === 42, JSON.stringify(r));
    assert(r[4] === 0.5, JSON.stringify(r));
    assert(r[5] === 1.5, JSON.stringify(r));
    assert(r[6] === 2.5, JSON.stringify(r));
    assert(r[7] === 3.5, JSON.stringify(r));
    assert(r[8] === 4.5, JSON.stringify(r));
    assert(r[9] === i+1, JSON.stringify(r));
    assert(r[10] === i+2, JSON.stringify(r));
    assert(r[11] === i+3, JSON.stringify(r));
}
