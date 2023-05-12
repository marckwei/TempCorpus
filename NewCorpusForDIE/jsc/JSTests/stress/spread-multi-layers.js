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

(function () {
    "use strict";

    function shouldBe(actual, expected)
    {
        if (actual !== expected)
            throw new Error('bad value: ' + actual);
    }
    noInline(shouldBe);

    var flag = false;

    function a(...args)
    {
        return b(...args);
    }

    function b(...args)
    {
        if (flag) {
            OSRExit();
            return args[0];
        }
        return c(...args);
    }

    function c(...args)
    {
        return d(...args);
    }

    function d(...args)
    {
        return Math.max(...args);
    }
    noInline(d);

    var array = [0, 1, 2, 3, 4, 5];
    for (var i = 0; i < 1e6; ++i) {
        flag = i > (1e6 - 100);
        var ret = a(...array);
        if (!flag)
            shouldBe(ret, 5);
        else
            shouldBe(ret, 0);
    }
}());
