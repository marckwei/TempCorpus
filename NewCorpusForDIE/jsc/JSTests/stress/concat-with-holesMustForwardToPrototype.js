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

Array.prototype[1] = 5;

function arrayEq(a, b) {
    if (a.length !== b.length)
        throw new Error([a, "\n\n",  b]);

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            throw new Error([a, "\n\n",  b]);
    }
}


let obj = {};
arrayEq([1,2,3].concat(4), [1,2,3,4]);
arrayEq([1,2,3].concat(1.34), [1,2,3,1.34]);
arrayEq([1.35,2,3].concat(1.34), [1.35,2,3,1.34]);
arrayEq([1.35,2,3].concat(obj), [1.35,2,3,obj]);
arrayEq([1,2,3].concat(obj), [1,2,3,obj]);
