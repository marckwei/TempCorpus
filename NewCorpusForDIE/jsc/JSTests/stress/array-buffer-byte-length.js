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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error(`bad value: ${String(actual)}`);
}

function shouldThrow(func, errorMessage)
{
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

{
    let arrayBuffer = new ArrayBuffer(42);
    let sharedArrayBuffer = new SharedArrayBuffer(500);
    shouldBe(arrayBuffer.byteLength, 42);
    shouldBe(sharedArrayBuffer.byteLength, 500);
    shouldBe(ArrayBuffer.prototype.hasOwnProperty('byteLength'), true);
    shouldBe(SharedArrayBuffer.prototype.hasOwnProperty('byteLength'), true);

    shouldBe(arrayBuffer.hasOwnProperty('byteLength'), false);
    shouldBe(sharedArrayBuffer.hasOwnProperty('byteLength'), false);

    shouldBe(!!Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get, true);
    shouldBe(!!Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get, true);

    shouldBe(!!Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').set, false);
    shouldBe(!!Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').set, false);

    shouldBe(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get !== Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get, true);

    shouldThrow(() => {
        Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get.call(sharedArrayBuffer);
    }, `TypeError: Receiver must be ArrayBuffer`);

    shouldThrow(() => {
        Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get.call(arrayBuffer);
    }, `TypeError: Receiver must be SharedArrayBuffer`);

    for (let value of [ 0, true, "Cocoa", null, undefined, Symbol("Cappuccino") ]) {
        shouldThrow(() => {
            Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get.call(value);
        }, `TypeError: Receiver must be ArrayBuffer`);
        shouldThrow(() => {
            Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get.call(value);
        }, `TypeError: Receiver must be SharedArrayBuffer`);
    }

    shouldThrow(() => {
        Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get.call({});
    }, `TypeError: Receiver must be ArrayBuffer`);
    shouldThrow(() => {
        Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get.call({});
    }, `TypeError: Receiver must be SharedArrayBuffer`);
}
