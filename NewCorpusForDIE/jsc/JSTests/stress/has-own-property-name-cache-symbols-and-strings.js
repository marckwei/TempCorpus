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
        throw new Error("Bad assertion.");
}
noInline(assert);

let objs = [];
let keyPool = [];
let symbolPool = [];
const numKeys = 300;
for (let i = 0; i < numKeys; ++i) {
    keyPool.push(i + "foo");
    symbolPool.push(Symbol("Foo"));
}

for (let i = 0; i < 2000; i++) {
    let num = (Math.random() * numKeys) | 0;
    let o = {};
    for (let i = 0; i < num; ++i) {
        o[keyPool[i]] = 25; 
        o[symbolPool[i]] = 40; 
    }
    objs.push(o);
}

let time = 0;
function foo(o) {
    let props = Object.getOwnPropertyNames(o);
    props.push(...Object.getOwnPropertySymbols(o));
    let start = Date.now();
    for (let i = 0; i < props.length; ++i) {
        let s = props[i];
        assert(o.hasOwnProperty(s));
    }
    time += Date.now() - start;
}
noInline(foo);

for (let o of objs) {
    foo(o);
}
const verbose = false;
if (verbose)
    print(time);
