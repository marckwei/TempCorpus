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

//@ skip if $memoryLimited or $addressBits <= 32
//@ runDefault()

function test() {

    // We don't support WebAssembly everywhere, so check for its existance before doing anything else.
    if (!this.WebAssembly)
        return;

    let bigArray = new Array(0x7000000);
    bigArray[0] = 1.1;
    bigArray[1] = 1.2;

    function foo(array) {
        var index = array.length;
        if (index >= bigArray.length || (index - 0x1ffdc01) < 0)
            return;
        return bigArray[index - 0x1ffdc01];
    }

    noInline(foo);

    var okArray = new Uint8Array(0x1ffdc02);

    for (var i = 0; i < 10000; ++i)
        foo(okArray);


    let maxSize = 0x10000;
    {
        var memory = new WebAssembly.Memory({ initial: 0x1000, maximum: maxSize });
        memory.grow(maxSize - 0x1000);
        var result = foo(new Uint8Array(memory.buffer));
        if (result !== void 0)
            throw "Error: bad result at end: " + result;
    }

    var ok = false;
    try {
        var memory = new WebAssembly.Memory({ initial: 0x1000, maximum: maxSize+1 });
        memory.grow(maxSize + 1 - 0x1000);
        var result = foo(new Uint8Array(memory.buffer));
        ok = true;
    } catch (e) {
        if (e.toString() != "RangeError: WebAssembly.Memory 'maximum' page count is too large")
            throw e;
    }
    if (ok)
        throw "Error: did not throw error";

}

test();
