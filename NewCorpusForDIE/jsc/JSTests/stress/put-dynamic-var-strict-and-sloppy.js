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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldThrow(func, errorMessage) {
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

(function () {
    var flag = true;
    var scope = {
        resolveStrict: 20,
        resolveSloppy: 20,
    };

    with (scope) {
        var putValueStrict = function (text, value)
        {
            if (flag)
                eval(text); // Make resolution Dynamic.
            var result = (function () {
                "use strict";
                resolveStrict = value;
            }());
            return result;
        };
        noInline(putValueStrict);

        var resolveSloppy = 20;
        var putValueSloppy = function (text, value)
        {
            if (flag)
                eval(text); // Make resolution Dynamic.
            var result = (function () {
                resolveSloppy = value;
            }());
            return result;
        }
        noInline(putValueSloppy);
    }

    putValueStrict(`var resolveStrict = 20`, i);
    putValueSloppy(`var resolveSloppy = 20`, i);
    flag = false;

    for (var i = 0; i < 4e3; ++i) {
        putValueStrict(``, i);
        shouldBe(scope.resolveStrict, i);
        putValueSloppy(``, i);
        shouldBe(scope.resolveSloppy, i);
    }
    Object.freeze(scope);
    shouldThrow(() => {
        putValueStrict(``, 0);
    }, `TypeError: Attempted to assign to readonly property.`);
    putValueSloppy(``, 0);
    shouldBe(scope.resolveSloppy, 4e3 - 1);
}());
