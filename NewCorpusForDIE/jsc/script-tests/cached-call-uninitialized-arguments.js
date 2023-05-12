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

description(
"This test checks that uninitialized parameters for cached call functions correctly defaults to undefined."

);

function doForEach(arr) {
    function callback(element, index, array, arg4, arg5, arg6) {

        function shouldBeUndefined(_a) {
            var exception;
            var _av;
            try {
                _av = eval(_a);
            } catch (e) {
                exception = e;
            }

            if (exception)
                testFailed(_a + " should be undefined. Threw exception " + exception);
            else if (typeof _av == "undefined")
                testPassed(_a + " is undefined.");
            else
                testFailed(_a + " should be undefined. Was " + _av);
        }

        shouldBeUndefined("arg4");
        shouldBeUndefined("arg5");
        shouldBeUndefined("arg6");
    }

    arr.forEach(callback);
}

function callAfterRecursingForDepth(depth, func, arr) {
    if (depth > 0) {
        callAfterRecursingForDepth(depth - 1, func, arr);
    } else {
        func(arr);
    }
}

var arr = [1];
callAfterRecursingForDepth(20, doForEach, arr);
