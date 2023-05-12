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

const obj = {};
for (let i = 0; i < 100; ++i)
    obj["k" + i] = i;

function getter1() {}
function getter2() {}
function setter1(v) {}
function setter2(v) {}

const descGet1 = {get: getter1, configurable: true};
const descGet1Set1 = {get: getter1, set: setter1};
const descGet2Set1 = {get: getter2, set: setter1};
const descGet1Set2 = {get: getter1, set: setter2};
const descGet2Set2 = {get: getter2, set: setter2};

for (let i = 0; i < 1e4; ++i) {
    const key = "k" + (i % 100);
    Object.defineProperty(obj, key, descGet1);
    Object.defineProperty(obj, key, descGet1Set1);
    Object.defineProperty(obj, key, descGet2Set1);
    Object.defineProperty(obj, key, descGet1Set2);
    Object.defineProperty(obj, key, descGet2Set2);
}
