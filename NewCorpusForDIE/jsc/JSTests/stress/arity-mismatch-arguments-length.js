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
    function test1(arg1, arg2, arg3)
    {
        return arguments.length;
    }

    function test()
    {
        shouldBe(test1(), 0);
        shouldBe(test1(0), 1);
        shouldBe(test1(0, 1), 2);
        shouldBe(test1(0, 1, 2), 3);
        shouldBe(test1(0, 1, 2, 3), 4);
    }
    noInline(test);

    for (var i = 0; i < 1e4; ++i)
        test();
}());

(function () {
    function test1(flag, arg1, arg2, arg3)
    {
        if (flag)
            OSRExit();
        return arguments;
    }

    function test(flag)
    {
        shouldBe(test1(flag).length, 1);
        shouldBe(test1(flag, 0).length, 2);
        shouldBe(test1(flag, 0, 1).length, 3);
        shouldBe(test1(flag, 0, 1, 2).length, 4);
        shouldBe(test1(flag, 0, 1, 2, 3).length, 5);
    }
    noInline(test);
    for (var i = 0; i < 1e5; ++i)
        test(false);

    test(true);
    test(true);
    test(true);
}());
