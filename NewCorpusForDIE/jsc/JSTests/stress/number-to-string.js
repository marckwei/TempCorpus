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
        throw new Error(`bad value: expected:(${expected}),actual:(${actual})`);
}

function expected(num, radix)
{
    let characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    let negative = false;
    if (num < 0) {
        negative = true;
        num = -num;
    }

    do {
        const index = num % radix;
        result = characters[index] + result;
        num = (num - index) / radix;
    } while (num);

    if (negative)
        return '-' + result;
    return result;
}

{
    function int32ToString(num)
    {
        return num.toString(16);
    }
    noInline(int32ToString);

    for (var i = 0; i < 1e3; ++i) {
        shouldBe(int32ToString(i), expected(i, 16));
        shouldBe(int32ToString(-i), expected(-i, 16));
    }

    shouldBe(int32ToString(0xffffffffff), expected(0xffffffffff, 16));
    shouldBe(int32ToString(0.1), `0.1999999999999a`);
    shouldBe(int32ToString(-0.1), `-0.1999999999999a`);
    shouldBe(int32ToString(new Number(0xff)), `ff`);
}

{
    function int52ToString(num)
    {
        return fiatInt52(num).toString(16);
    }
    noInline(int52ToString);

    for (var i = 0; i < 1e3; ++i) {
        shouldBe(int52ToString(0xffffffff + i), expected(0xffffffff + i, 16));
        shouldBe(int52ToString(-(0xffffffff + i)), expected(-(0xffffffff + i), 16));
    }

    shouldBe(int52ToString(0xff), `ff`);
    shouldBe(int52ToString(0.1), `0.1999999999999a`);
    shouldBe(int52ToString(-0.1), `-0.1999999999999a`);
    shouldBe(int52ToString(new Number(0xff)), `ff`);
}

{
    function doubleToString(num)
    {
        return num.toString(16);
    }
    noInline(doubleToString);

    for (var i = 0; i < 1e3; ++i) {
        shouldBe(doubleToString(1.01), `1.028f5c28f5c29`);
        shouldBe(doubleToString(-1.01), `-1.028f5c28f5c29`);
    }

    shouldBe(doubleToString(0xff), `ff`);
    shouldBe(doubleToString(0.1), `0.1999999999999a`);
    shouldBe(doubleToString(-0.1), `-0.1999999999999a`);
    shouldBe(doubleToString(new Number(0xff)), `ff`);
}
