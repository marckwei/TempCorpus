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

// Regression test for https://bugs.webkit.org/show_bug.cgi?id=157322.  This test should not crash.

let fromArray = [];
let toArray = [];
let dummyArray = [];
let endObj1 = {
    valueOf: function() {
        let originalLength = fromArray.length;
        fromArray.length = 1;

        dummyArray = new Float64Array(1000);

        return originalLength;
    }
};

let endObj2 = {
    valueOf: function() {
        let originalLength = fromArray.length;
        fromArray.length = 1;

        dummyArray = new Float64Array(1000);

        fromArray = [];
        fromArray.length = originalLength;

        return originalLength;
    }
};

let initialArray = [];
for (let i = 0; i < 8000; i++)
        initialArray.push(i + 0.1);

for (let loop = 0; loop < 1000; loop++) {
    fromArray = initialArray.slice(0);

    let endObj = (loop % 2 == 1) ? endObj1 : endObj2;

    // These calls shouldn't crash
    toArray = fromArray.slice(0, endObj);
    toArray = fromArray.splice(0, endObj);
}
