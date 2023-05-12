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

function logLinesWithContext(n, context) {
    let start = n - context;
    let end = n + context;
    for (let x = start; x <= end; ++x) {
        let number = x.toString().padStart(3);
        if (parseInt(number) !== x)
            throw new Error("Bad result from pad start: " + number);
    }
}
noInline(logLinesWithContext);

let numbers = [
    19,19,19,19,19,19,19,20,20,20,20,20,20,20,11,11,11,11,11,11,11,20,20,20,20,
    20,20,20,15,15,15,15,15,15,15,21,21,21,21,21,21,21,19,19,19,19,19,19,19,20,
    20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,24,24,24,24,24,
    24,24,25,25,25,25,25,25,25,11,11,11,11,11,11,11,25,25,25,25,25,25,25,15,15,
    15,15,15,15,15,25,25,25,25,25,25,25,7,7,7,7,7,7,7,26,26,26,26,26,26,26,24,
    24,24,24,24,24,24,25,25,25,25,25,25,25,11,11,11,11,11,11,11,25,25,25,25,25,
    25,25,26,26,26,26,26,26,26,24,24,24,24,24,24,24,25,25,25,25,25,25,25,11,11,
    11,11,11,11,11,12,12,12,12,12,12,12,25,25,25,25,25,25,25,15,15,15,15,15,15,
    15,16,16,16,16,16,16,16,25,25,25,25,25,25,25,7,7,7,7,7,7,7,8,8,8,8,8,8,8,
    26,26,26,26,26,26,26,24,24,24,24,24,24,24,25,25,25,25,25,25,25,11,11,11,11,
    11,11,11,12,12,12,12,12,12,12,25,25,25,25,25,25,25,15,15,15,15,15,15,15,16,
    16,16,16,16,16,16,25,25,25,25,25,25,25,7,7,7,7,7,7,7,8,8,8,8,8,8,8,26,26,
    26,26,26,26,26,29,29,29,29,29,29,29,30,30,30,30,30,30,30,35,35,35,35,35,35,
    35,29,29,29,29,29,29,29,30,30,30,30,30,30,30,11,11,11,11,11,11,11,33,33,33,
    33,33,33,33,35,35,35,35,35,35,35,39,39,39,39,39,39,39,40,40,40,40,40,40,40,
    11,11,11,11,11,11,11,40,40,40,40,40,40,40,40,40,40,40,40,40,40,15,15,15,15,
    15,15,15,41,41,41,41,41,41,41,39,39,39,39,39,39,39,40,40,40,40,40,40,40,40,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
    45,45,46,46,46,46,46,46,46,11,11,11,11,11,11,11,46,46,46,46,46,46,46,15,15,
];

for (let n of numbers)
    logLinesWithContext(n, 3);
