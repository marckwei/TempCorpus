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
        throw new Error;
}

function test1() {
    let x = new Int8Array(1);
    let y = new Uint8Array(1);
    x[0] = -1;
    y.set(x);
    assert(y[0] === 255);
}
test1();

function test2() {
    let x = new Int8Array(1);
    let y = new Uint8Array(1);
    y[0] = 255;
    x.set(y);
    assert(x[0] === -1);
}
test2();

function test3() {
    let x = new Int16Array(1);
    let y = new Uint16Array(1);
    x[0] = -1;
    y.set(x);
    assert(y[0] === 65535);
}
test3();

function test4() {
    let x = new Int16Array(1);
    let y = new Uint16Array(1);
    y[0] = 65535;
    x.set(y);
    assert(x[0] === -1);
}
test4();

function test5() {
    let x = new Int32Array(1);
    let y = new Uint32Array(1);
    x[0] = -1;
    y.set(x);
    assert(y[0] === 4294967295);
}
test5();

function test6() {
    let x = new Int32Array(1);
    let y = new Uint32Array(1);
    y[0] = 4294967295;
    x.set(y);
    assert(x[0] === -1);
}
test6();

function test7() {
    let x = new Uint8ClampedArray(1);
    let y = new Int8Array(1);
    x[0] = 255;
    y.set(x);
    assert(y[0] === -1);
}
test7();
