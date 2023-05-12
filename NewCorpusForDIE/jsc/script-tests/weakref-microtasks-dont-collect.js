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

asyncTestStart(1);

function makeWeakRef() { return new WeakRef({foo: 1 }); }
noInline(makeWeakRef);

// Turns out the test times out if we turn the event loop 10000 times...
let loopCount = globalThis.window ? 300 : 10000;
function turnEventLoop() {
    return new Promise(function(resolve, reject) {
        if (globalThis.window) {
            window.setTimeout(() => {
                resolve();
            }, 0);
        } else {
            releaseWeakRefs();
            resolve();
        }
    });
}

let weakRefs = [];

async function* foo() {
    let weak = makeWeakRef();
    let object = weak.deref();
    yield await 1;
    if (weak.deref() !== object)
        throw new Error("Object appears to have been collected incorrectly");
    object = null;
    yield await turnEventLoop();
    weakRefs.push(weak);
}

async function test() {
    for (let i = 0; i < loopCount; i++) {
        for await (value of foo()) { }
    }
    gc();

    if (weakRefs.find((weak) => weak.deref() === undefined) === undefined)
        throw new Error("No weak ref value was collected");
    asyncTestPassed();
}


test().catch(e => debug(e));
