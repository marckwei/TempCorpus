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
var objects = [];
var weakRefs = [];
var finalizerCalled = false;
var finalizationRegistry = new FinalizationRegistry(() => finalizerCalled = true);
function makeWeakRef() { return new WeakRef({ foo: 1 }); }
noInline(makeWeakRef);

// At the time of writing this test standalone-pre.js prints newlines slightly differently from js-test-pre.js for async tests so we don't use the shouldBe helpers...
function assert(condition, msg = "") {
    if (!condition)
        throw new Error(msg);
}

let loopCount = 1000;
function turnEventLoop() {
    return new Promise(function(resolve) {
        setTimeout(() => {
            gc();
            resolve();
        }, 1);
    });
}

var i;
async function test() {
    for (let i = 0; i < loopCount; i++) {
        let weak = makeWeakRef();
        weakRefs.push(weak);
        objects.push(weak.deref());
        finalizationRegistry.register(weak.deref());
    }

    await turnEventLoop();

    assert(finalizerCalled === false);
    for (i = 0; i < loopCount; i++)
        assert(weakRefs[i].deref() === objects[i], "failed on iteration: " + i);

    objects.length = 0;
    objects = null;

    await turnEventLoop();
    // We need to turn the event loop again since FR may not have called the callback in the last turn.
    await turnEventLoop();

    assert(finalizerCalled === true);
    assert(weakRefs.some((weakRef) => weakRef.deref() === undefined) === true);

    asyncTestPassed();
}

test().catch(e => debug(e));
