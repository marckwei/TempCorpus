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

//@ runNoJIT

function stackTraceDescription(stackFrame) {
    let indexOfAt = stackFrame.indexOf('@')
    let indexOfLastSlash = stackFrame.lastIndexOf('/');
    if (indexOfLastSlash == -1)
        indexOfLastSlash = indexOfAt
    let functionName = stackFrame.substring(0, indexOfAt);
    let fileName = stackFrame.substring(indexOfLastSlash + 1);
    return functionName + " at " + fileName;
}

function foo(j) {
    for (let i = 0; i < 20; i++) {
        i--;
        i++;
    }
    foo(j + 1);
}

let error = null;
try {
    foo(10);
} catch(e) {
    error = e; 
}

if (!error)
    throw new Error("No exception!");

let frame = error.stack.split("\n")[0];
let description = stackTraceDescription(frame);
if (description.indexOf(".js:18") < 0)
    throw new Error("Bad location: '" + description + "'");

