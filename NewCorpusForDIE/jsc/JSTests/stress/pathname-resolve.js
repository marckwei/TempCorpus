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

//@ skip
// To execute this test, need to specify the JSC_exposeInternalModuleLoader environment variable and execute it on non Windows platform.
function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`bad value: ${String(actual)}`);
}

function shouldResolve(name, referrer, expected)
{
    var promise = Loader.resolve(name, referrer);
    return promise.then(function (actual) {
        shouldBe(actual, expected);
    });
}

function shouldThrow(name, referrer, errorMessage)
{
    var notThrown = false;
    return Loader.resolve(name, referrer).then(function (error) {
        notThrown = true;
    }).catch(function (error) {
        shouldBe(String(error), errorMessage);
    }).then(function () {
        if (notThrown)
            throw new Error("not thrown");
    });
}

var error = null;

// On windows platform, all "/" becomes "\".
Promise.all([
    shouldResolve('tmp.js', '/home/WebKit/', '/home/WebKit/tmp.js'),
    shouldResolve('tmp.js', '/home/', '/home/tmp.js'),
    shouldResolve('/tmp.js', '/home/WebKit/', '/tmp.js'),
    shouldResolve('///tmp.js', '/home/WebKit/', '/tmp.js'),
    shouldResolve('.///tmp.js', '/home/WebKit/', '/home/WebKit/tmp.js'),
    shouldResolve('./../tmp.js', '/home/WebKit/', '/home/tmp.js'),
    shouldResolve('./../../tmp.js', '/home/WebKit/', '/tmp.js'),
    shouldResolve('./../../../tmp.js', '/home/WebKit/', '/tmp.js'),
    shouldResolve('./../../home/../tmp.js', '/home/WebKit/', '/tmp.js'),
    shouldResolve('./../../../home/WebKit/../tmp.js', '/home/WebKit/', '/home/tmp.js'),
    shouldResolve('../home/WebKit/tmp.js', '/home/WebKit/', '/home/home/WebKit/tmp.js'),
    shouldResolve('../home/WebKit/../tmp.js', '/home/WebKit/', '/home/home/tmp.js'),
    shouldResolve('./tmp.js', '/home/WebKit/hello.js', '/home/WebKit/tmp.js'),

    shouldResolve('./tmp.js', 'C:/', 'C:/tmp.js'),
    shouldResolve('./tmp.js', 'C:/home/', 'C:/home/tmp.js'),
    shouldResolve('../tmp.js', 'C:/home/', 'C:/tmp.js'),
    shouldResolve('../../tmp.js', 'C:/home/', 'C:/tmp.js'),
    shouldResolve('./hello/tmp.js', 'C:/home/', 'C:/home/hello/tmp.js'),
    shouldResolve('/tmp.js', 'C:/home/', 'C:/tmp.js'),

    shouldThrow('/tmp.js', '', `Error: Could not resolve the referrer name ''.`),
    shouldThrow('/tmp.js', 'hello', `Error: Could not resolve the referrer name 'hello'.`),
    shouldThrow('tmp.js', 'hello', `Error: Could not resolve the referrer name 'hello'.`),
]).catch(function (e) {
    error = e;
});

// Force to run all pending tasks.
drainMicrotasks();
if (error)
    throw error;
