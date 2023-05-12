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

function test() {
    let x = new Int8Array(10000);
    let y = new Uint8Array(10000);
    for (let i = 0; i < x.length; ++i)
        x[i] = i;
    for (let i = 0; i < 500; ++i)
        y.set(x);
    for (let i = 0; i < 500; ++i)
        x.set(y);
}

function test2() {
    let x = new Int16Array(10000);
    let y = new Uint16Array(10000);
    for (let i = 0; i < x.length; ++i)
        x[i] = i;
    for (let i = 0; i < 500; ++i)
        y.set(x);
    for (let i = 0; i < 500; ++i)
        x.set(y);
}

function test3() {
    let x = new Int32Array(10000);
    let y = new Uint32Array(10000);
    for (let i = 0; i < x.length; ++i)
        x[i] = i;
    for (let i = 0; i < 500; ++i)
        y.set(x);
    for (let i = 0; i < 500; ++i)
        x.set(y);
}

function test4() {
    let x = new Uint8ClampedArray(10000);
    let y = new Int8Array(10000);
    for (let i = 0; i < x.length; ++i)
        x[i] = i;
    for (let i = 0; i < 500; ++i)
        y.set(x);
}

test();
test2();
test3();
test4();
