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

function noLoop(arr1, arr2) {
    let i=0
    if (arr1.size%2==0)
        i = 0
    else i = 0
    arr2[i] = arr1[i]
    return arr2
}
noInline(noLoop);

function invalidStart(arr1, arr2) {
    if (arr1.length != arr2.length)
        return []
    let i = 0
    do {
        ++i
        arr2[i] = arr1[i]
    } while (i < arr1.length-1)
    return arr2
}
noInline(invalidStart);

const size = 10
let arr1 = new Int32Array(size)
let arr2 = new Int32Array(size)
for (let i=0; i<arr1.length; ++i) {
    arr1[i] = i
}

const iterationCount = $vm.useJIT() ? 10000000 : 100;
for (let i=0; i<iterationCount; ++i) noLoop(arr1, arr2)
for (let i=0; i<iterationCount; ++i) invalidStart(arr1, arr2)

arr2 = new Int32Array(arr1.length)
invalidStart(arr1, arr2)

for (let i=1; i<arr1.length; ++i) {
    if (arr2[i] != arr1[i] || arr2[0] != 0)
        throw "Error: bad copy: " + i + " " + arr1[i] + " " + arr2[i]
}
