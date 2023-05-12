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

if (globalThis.console)
    globalThis.print = console.log.bind(console);

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

async function returnDirectPrimitive() {
    return 1;
}

async function returnAwaitPrimitive() {
    return await 1;
}

async function returnDirectPromisePrimitive() {
    return Promise.resolve(1);
}

async function returnAwaitPromisePrimitive() {
    return await Promise.resolve(1);
}

const resolved = Promise.resolve();

async function test(fn, expected) {
    let done = false;
    let count = 0;
    fn().then(() => { done = true; });

    function counter() {
        if (done)
            shouldBe(count, expected);
        else {
            resolved.then(() => {
                count++;
                counter();
            });
        }
    }
    counter();
}

async function tests() {
    await resolved;
    await test(returnDirectPrimitive, 1);
    await test(returnAwaitPrimitive, 2);

    await test(returnDirectPromisePrimitive, 3);
    await test(returnAwaitPromisePrimitive, 2);
}

if (globalThis.setUnhandledRejectionCallback) {
    setUnhandledRejectionCallback(function (promise) {
        $vm.abort();
    });
}

tests();
