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

var otherObject = {
    valueOf: function() { return 5.1; }
};
// DFG.
var targetDFG = {
    value: 5.5,
    multiply: function(arg) {
        let returnValue = 1;
        if (typeof arg == "number") {
            returnValue = this.value * arg;
        }
        return returnValue + 1;
    }
};
noInline(targetDFG.multiply);

for (let i = 0; i < 400; ++i) {
    if (targetDFG.multiply(otherObject) !== 2)
        throw "Failed targetDFG.multiply(otherObject)";
    let result = targetDFG.multiply(Math.PI);
    if (result !== (5.5 * Math.PI + 1))
        throw "Failed targetDFG.multiply(Math.PI), expected " + (5.5 * Math.PI + 1) + " got " + result + " at iteration " + i;
}
for (let i = 0; i < 1e3; ++i) {
    let result = targetDFG.multiply(Math.PI);
    if (result !== (5.5 * Math.PI + 1))
        throw "Failed targetDFG.multiply(Math.PI), expected " + (5.5 * Math.PI + 1) + " got " + result + " at iteration " + i;
}

// FTL.
var targetFTL = {
    value: 5.5,
    multiply: function(arg) {
        let returnValue = 1;
        if (typeof arg == "number") {
            returnValue = this.value * arg;
        }
        return returnValue + 1;
    }
};
noInline(targetFTL.multiply);

// Warmup to baseline.
for (let i = 0; i < 400; ++i) {
    if (targetFTL.multiply(otherObject) !== 2)
        throw "Failed targetFTL.multiply(otherObject)";
    let result = targetFTL.multiply(Math.PI);
    if (result !== (5.5 * Math.PI + 1))
        throw "Failed targetFTL.multiply(Math.PI), expected " + (5.5 * Math.PI + 1) + " got " + result + " at iteration " + i;
}

// Step over DFG *WITHOUT* OSR Exit.
for (let i = 0; i < 1e6; ++i) {
    if (targetFTL.multiply(otherObject) !== 2)
        throw "Failed targetFTL.multiply(otherObject)";
}

// Now OSR Exit in FTL.
for (let i = 0; i < 1e2; ++i) {
    let result = targetFTL.multiply(Math.PI);
    if (result !== (5.5 * Math.PI + 1))
        throw "Failed targetFTL.multiply(Math.PI), expected " + (5.5 * Math.PI + 1) + " got " + result + " at iteration " + i;
}
