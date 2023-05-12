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

// #0
// o = {}
// o2 = {}
// jump #1
// 
// #1
// o.f = o2
// effects()
// x = o.f
// escape(o)
// branch #2, #1
// 
// #2
// x cannot be o2 here, it has to be TOP

let count = 0;
function bool() { 
    ++count;
    return !!(count % 2);
}
noInline(bool);

let o;
function effects() { if (!o) return; o.f = 42; }
noInline(effects);

function escape(theO) { o = theO; }
noInline(escape);

function bar() {
    let o = {};
    let o2 = {};
    let p;
    for (let i = 0; i < 10; ++i) {
        o.f = o2;
        effects();
        let x = o.f;
        escape(o);
        if (bool())
            continue;
        p = x;
    }
    return p;
}
noInline(bar);

for (let i = 0; i < 10000; ++i) {
    if (bar() !== 42)
        throw new Error;
}
