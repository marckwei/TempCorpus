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
        throw new Error('bad value: ' + actual);
}

(function () {
    function test2(...rest)
    {
        return rest;
    }

    function test1(arg1, arg2, arg3)
    {
        return test2(arg1, arg2, arg3);
    }

    function test()
    {
        var result = test1();
        shouldBe(result.length, 3);
        shouldBe(result[0], undefined);
        shouldBe(result[1], undefined);
        shouldBe(result[2], undefined);
    }
    noInline(test);

    for (var i = 0; i < 1e4; ++i)
        test();
}());

(function () {
    function test1(...rest)
    {
        return rest;
    }

    function test()
    {
        var result = test1();
        shouldBe(result.length, 0);
    }
    noInline(test);

    for (var i = 0; i < 1e4; ++i)
        test();
}());

(function () {
    function test1(...rest)
    {
        return rest;
    }
    noInline(test1);

    function test()
    {
        var result = test1();
        shouldBe(result.length, 0);
    }
    noInline(test);

    for (var i = 0; i < 1e4; ++i)
        test();
}());
