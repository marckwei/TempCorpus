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

let error = null;
try {
    eval('let r = "prop" i\\u{006E} 20');
} catch(e) {
    error = e;
}

if (!error || error.message !== "Unexpected escaped characters in keyword token: 'i\\u{006E}'")
    throw new Error("Bad");

error = null;
try {
    eval('let r = "prop" i\\u006E 20');
} catch(e) {
    error = e;
}

if (!error || error.message !== "Unexpected escaped characters in keyword token: 'i\\u006E'")
    throw new Error("Bad");

// This test should not crash.
error = null;
try {
    eval('let r = "prop" i\u006E 20');
} catch(e) {
    error = e;
}

if (!error || error.message !== "20 is not an Object. (evaluating \'\"prop\" in 20\')")
    throw new Error("Bad");