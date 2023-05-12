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

typedArrays = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];


function call(thunk) {
    thunk();
}
noInline(call);

let name = ["map", "reduce"];
// First test with every access being neutered.
function test(constructor) {
    let array = new constructor(10);
    transferArrayBuffer(array.buffer);
    for (let i = 0; i < 10000; i++) {
        call(() => {
            if (array.map !== constructor.prototype.map)
                throw new Error();
        });
        call(() => {
            if (array[name[i % 2]] !== constructor.prototype[name[i % 2]])
                throw new Error();
        });
    }
}

for (constructor of typedArrays) {
    test(constructor);
}

// Next test with neutered after tier up.
function test(constructor) {
    let array = new constructor(10);
    let i = 0;
    fnId = () =>  {
        if (array.map !== constructor.prototype.map)
            throw new Error();
    };
    fnVal = () => {
        if (array[name[i % 2]] !== constructor.prototype[name[i % 2]])
            throw new Error();
    };
    for (; i < 10000; i++) {
        call(fnId);
        call(fnVal);
    }
    transferArrayBuffer(array.buffer);
    call(fnId);
    call(fnVal);
}
